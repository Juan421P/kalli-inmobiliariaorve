import api from './apiClient';

// Convierte "55779878" o "5577-9878" a "5577-9878" (formato que exige el backend: dddd-dddd)
const formatPhone = (raw) => {
    const digits = (raw ?? '').replace(/\D/g, '');
    return digits.length === 8 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : raw;
};

const clientService = {
    async register({ name, lastname, email, password, confirmPassword, phone, document_type, document_number }) {
        return api.post('/client/register', {
            name,
            lastname,
            email,
            password,
            confirm_password: confirmPassword ?? password,
            phone: { country_code: '+503', number: formatPhone(phone) },
            document: { type: document_type?.toLowerCase(), number: document_number },
        });
    },
    async verifyEmail({ code, token }) {
        return api.post('/client/verify-email', { token, code });
    },
    async resendVerification({ email }) {
        return api.post('/client/resend-verification', { email });
    },
    async login({ email, password }) {
        return api.post('/client/login', { email, password });
    },
    async logout() {
        return api.post('/client/logout');
    },
    async requestPasswordRecovery({ email }) {
        return api.post('/client/password-recovery/request', { email });
    },
    async verifyRecoveryCode({ code, token }) {
        return api.post('/client/password-recovery/verify', { token, code });
    },
    async resetPassword({ token, newPassword, confirmPassword }) {
        return api.post('/client/password-recovery/change-password', {
            token,
            new_password: newPassword,
            confirm_password: confirmPassword,
        });
    },
    async get(id) {
        return api.get(`/client/${id}`);
    },
    async update(id, { name, lastname, email, phone }) {
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (lastname !== undefined) updates.lastname = lastname;
        if (phone !== undefined) updates.phone = { country_code: '+503', number: formatPhone(phone) };
        void email; // el backend lo ignora/rechaza en update, igual que en la web
        return api.put(`/client/${id}`, updates);
    },
};

export default clientService;
