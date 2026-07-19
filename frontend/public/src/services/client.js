import { api } from './service.js';

// Convierte "55779878" o "5577-9878" a "5577-9878" (formato que exige el backend: dddd-dddd)
const formatPhone = (raw) => {
    const digits = (raw ?? '').replace(/\D/g, '');
    return digits.length === 8 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : raw;
};

// El backend ya no usa cookies para los flujos de verificación de correo y
// recuperación de contraseña: /client/register y /client/password-recovery/request
// devuelven un token en el cuerpo de la respuesta, y ese mismo token hay que
// reenviarlo en el siguiente paso del flujo (verify-email, verify-recovery-code,
// change-password). Como los componentes/hooks del frontend público no manejan
// ese token (llaman a los métodos de este service sin pasarlo), lo guardamos
// aquí en memoria y lo encadenamos automáticamente entre pasos.
let verificationToken = null; // usado por register -> verifyEmail
let recoveryToken = null;     // usado por requestPasswordRecovery -> verifyRecoveryCode -> resetPassword

const ClientService = {
    async register({ name, lastname, email, password, confirmPassword, phone, document_type, document_number, picture, pictureId }) {
        // NOTA (backend): backend/src/controllers/client.js -> register descarta el
        // token que arma el service, así que hoy esta respuesta NO trae token y el
        // paso de verifyEmail no puede completarse hasta que se corrija ese controller.
        //
        // NOTA (backend, SIN solución posible desde el frontend): el schema de Zod
        // valida `phone.countryCode` / `pictureId` (camelCase), pero el modelo de
        // Mongoose exige `phone.country_code` / `picture_id` (snake_case), y
        // country_code es `required`. Como el objeto `phone` de Zod no tiene
        // `.strict()`, cualquier campo que no sea `countryCode` se descarta
        // silenciosamente ANTES de llegar a Mongoose — no existe ningún payload
        // que evite el `ValidationError: phone.country_code is required` desde
        // acá. Hay que mapear los nombres en backend/src/services/client.js antes
        // del model.create, o renombrar los campos del modelo.
        const { data } = await api.post('/client/register', {
            name,
            lastname,
            email,
            password,
            confirmPassword: confirmPassword ?? password,
            phone: { countryCode: '+503', number: formatPhone(phone) },
            document: { type: document_type?.toLowerCase(), number: document_number },
            picture: picture ?? `https://ui-avatars.com/api/?background=0D6B5E&color=fff&name=${encodeURIComponent(`${name ?? ''} ${lastname ?? ''}`.trim())}`,
            pictureId: pictureId ?? 'default'
        });
        verificationToken = data?.token ?? null;
        return data;
    },
    async verifyEmail({ code }) {
        const { data } = await api.post('/client/verify-email', { token: verificationToken, code });
        verificationToken = null;
        return data;
    },
    async login({ email, password }) {
        const { data } = await api.post('/client/login', { email, password });
        return data;
    },
    async logout() {
        const { data } = await api.post('/client/logout');
        return data;
    },
    async requestPasswordRecovery({ email }) {
        const { data } = await api.post('/client/password-recovery/request', { email });
        recoveryToken = data?.token ?? null;
        return data;
    },
    async verifyRecoveryCode({ code }) {
        const { data } = await api.post('/client/password-recovery/verify', { token: recoveryToken, code });
        recoveryToken = data?.token ?? recoveryToken;
        return data;
    },
    async resetPassword({ newPassword, confirmPassword }) {
        const { data } = await api.post('/client/password-recovery/change-password', {
            token: recoveryToken,
            newPassword,
            confirmPassword
        });
        recoveryToken = null;
        return data;
    },
    async get(id) {
        const { data } = await api.get(`/client/${id}`);
        return data;
    },
    async update(id, { name, lastname, email, phone, document_type, document_number, picture, pictureId }) {
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (lastname !== undefined) updates.lastname = lastname;
        if (phone !== undefined) updates.phone = { countryCode: '+503', number: formatPhone(phone) };
        if (picture !== undefined) updates.picture = picture;
        if (pictureId !== undefined) updates.pictureId = pictureId;
        void email; void document_type; void document_number; // el backend los ignora/rechaza en update
        const { data } = await api.put(`/client/${id}`, { updates });
        return data;
    },
    async uploadPicture(file) {
        const { data: me } = await api.get('/auth/me');
        const id = me?.user?.id;
        if (!id) throw new Error('no hay sesión activa para subir la foto de perfil');
        const form = new FormData();
        form.append('picture', file);
        const { data } = await api.put(`/client/${id}/image`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    }
};
export default ClientService;