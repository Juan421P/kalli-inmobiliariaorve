import { api } from './Service.js';

// Convierte "55779878" o "5577-9878" a "5577-9878" (formato que exige el backend: dddd-dddd)
const formatPhone = (raw) => {
    const digits = (raw ?? '').replace(/\D/g, '');
    return digits.length === 8 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : raw;
};

// Los flujos de verificación de correo y recuperación de contraseña usan token
// en el cuerpo de la respuesta, no cookie: /client/register y
// /client/password-recovery/request devuelven un token que hay que reenviar en
// el siguiente paso (verify-email, verify-recovery-code, change-password).
// Los hooks del frontend no manejan ese token, así que lo guardamos aquí en
// memoria y lo encadenamos automáticamente entre pasos.
let verificationToken = null; // usado por register -> verifyEmail
let recoveryToken = null;     // usado por requestPasswordRecovery -> verifyRecoveryCode -> resetPassword

const clientService = {
    async register({ name, lastname, email, password, confirmPassword, phone, document_type, document_number, picture, pictureId }) {
        const { data } = await api.post('/client/register', {
            name,
            lastname,
            email,
            password,
            confirm_password: confirmPassword ?? password,
            phone: { country_code: '+503', number: formatPhone(phone) },
            document: { type: document_type?.toLowerCase(), number: document_number },
        });
        verificationToken = data?.token ?? null;
        return data;
    },
    async verifyEmail({ code }) {
        const { data } = await api.post('/client/verify-email', { token: verificationToken, code });
        verificationToken = null;
        return data;
    },
    async resendVerification({ email }) {
        const { data } = await api.post('/client/resend-verification', { email });
        verificationToken = data?.token ?? null;
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
            new_password: newPassword,
            confirm_password: confirmPassword
        });
        recoveryToken = null;
        return data;
    },
    async get(id) {
        const { data } = await api.get(`/client/${id}`);
        return data;
    },
    // PUT /client/:id solo acepta name, lastname, phone y active (schemas.update
    // es .strict()). Email y documento no son editables desde el perfil: si se
    // mandan, Zod rechaza el request completo con 400.
    async update(id, { name, lastname, phone, picture, pictureId }) {
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (lastname !== undefined) updates.lastname = lastname;
        if (phone !== undefined) updates.phone = { country_code: '+503', number: formatPhone(phone) };
        if (picture !== undefined) updates.picture = picture;
        if (pictureId !== undefined) updates.picture_id = pictureId;

        if (Object.keys(updates).length === 0) {
            throw new Error('no hay cambios que guardar');
        }

        // El backend espera el objeto de cambios directo en el body, no envuelto
        // en { updates }: PUT /client/:id -> controller.put pasa req.body tal cual
        // a service.update(id, updates).
        const { data } = await api.put(`/client/${id}`, updates);
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
export default clientService;