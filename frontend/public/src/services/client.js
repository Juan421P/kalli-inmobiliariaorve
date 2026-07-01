import axios from 'axios';
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Convierte "55779878" o "5577-9878" a "5577-9878" (formato que exige el backend)
const formatPhone = (raw) => {
    const digits = (raw ?? '').replace(/\D/g, '');
    return digits.length === 8 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : raw;
};

const ClientService = {
    async register({ name, lastname, email, password, phone, document_type, document_number }) {
        const { data } = await api.post('/client', {
            name, lastname, email, password,
            phone: { country_code: '+503', number: formatPhone(phone) },
            document: { type: document_type?.toLowerCase(), number: document_number }
        });
        return data;
    },
    async verifyEmail({ code }) {
        const { data } = await api.post('/client/verify-email', { code });
        console.log(data);
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
        return data;
    },
    async verifyRecoveryCode({ code }) {
        const { data } = await api.post('/client/password-recovery/verify', { code });
        return data;
    },
    async resetPassword({ newPassword, confirmPassword, }) {
        const { data } = await api.post('/client/password-recovery/change-password', { newPassword, confirmPassword, });
        return data;
    },
    async get(id) {
        const { data } = await api.get(`/client/${id}`);
        return data;
    },
    async update(id, { name, lastname, email, phone, document_type, document_number, picture }) {
        const { data } = await api.put(`/client/${id}`, {
            name, lastname, email,
            ...(phone !== undefined && { phone: { country_code: '+503', number: formatPhone(phone) } }),
            ...((document_type !== undefined || document_number !== undefined) && {
                document: { type: document_type?.toLowerCase(), number: document_number }
            }),
            picture
        });
        return data;
    },
    async uploadPicture(file) {
        const form = new FormData();
        form.append('picture', file);
        const { data } = await api.post('/client/image', form);
        return data;
    },
};
export default ClientService;