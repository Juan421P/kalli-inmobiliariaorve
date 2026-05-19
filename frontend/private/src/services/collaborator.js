import Service from './service.js';
class CollaboratorService extends Service {
    constructor() {
        super('/collaborator');
    }
    async search(searchParams) {
        const response = await this.api.post(`${this.endpoint}/search`, searchParams);
        return response.data;
    }
    async login(email, password) {
        const response = await this.api.post(`${this.endpoint}/login`, { email, password });
        return response.data;
    }
    async verifyEmail(verificationData) {
        const response = await this.api.post(`${this.endpoint}/verify-email`, verificationData);
        return response.data;
    }
    async requestPasswordRecovery(email) {
        const response = await this.api.post(`${this.endpoint}/password-recovery/request`, { email });
        return response.data;
    }
    async verifyPasswordRecovery(verificationData) {
        const response = await this.api.post(`${this.endpoint}/password-recovery/verify`, verificationData);
        return response.data;
    }
    async changePassword(passwordData) {
        const response = await this.api.post(`${this.endpoint}/password-recovery/change-password`, passwordData);
        return response.data;
    }
    async logout() {
        const response = await this.api.post(`${this.endpoint}/logout`);
        return response.data;
    }
}
export default new CollaboratorService();