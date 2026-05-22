import Service from './service.js';
class AdminService extends Service {
    constructor() {
        super('/admin');
    }
    async search(searchParams) {
        return await this.api.post(`${this.endpoint}/search`, searchParams).then((response) => response.data);
    }
    async login(email, password) {
        return await this.api.post(`${this.endpoint}/login`, { email, password }).then((response) => response.data);
    }
    async verifyEmail(data) {
        return await this.api.post(`${this.endpoint}/verify-email`, data).then((response) => response.data);
    }
    async requestPasswordRecovery(email) {
        return await this.api.post(`${this.endpoint}/password-recovery/request`, { email }).then((response) => response.data);
    }
    async verifyPasswordRecovery(data) {
        return await this.api.post(`${this.endpoint}/password-recovery/verify`, data).then((response) => response.data);
    }
    async changePassword(data) {
        return await this.api.post(`${this.endpoint}/password-recovery/change-password`, data).then((response) => response.data);
    }
    async logout() {
        return await this.api.post(`${this.endpoint}/logout`).then((response) => response.data);
    }
}
export default new AdminService();