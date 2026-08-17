import Service from './service.js';
class AdminService extends Service {
    constructor() {
        super('/admin');
    }
    async getAll() {
        return await this.api.get(this.endpoint).then((response) => response.data);
    }
    // el backend espera multipart/form-data (requiere foto) y crea la cuenta
    // como una invitación: el administrador define su propia contraseña después
    async create({ name, lastname, email, phone, documentType, documentNumber, avatarFile }) {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('lastname', lastname)
        formData.append('email', email)
        // El backend reconvierte a objeto los campos anidados que llegan como JSON.stringify
        formData.append('phone', JSON.stringify(phone))
        formData.append('document', JSON.stringify({ type: documentType, number: documentNumber }))
        formData.append('picture', avatarFile)
        return await this.api.post(`${this.endpoint}/invite`, formData).then((response) => response.data);
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
    async completeInvitation(data) {
        return await this.api.post(`${this.endpoint}/complete-invitation`, data).then((response) => response.data);
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
    async uploadPicture(id, file) {
        const formData = new FormData();
        formData.append('picture', file);
        return await this.api.put(`${this.endpoint}/${id}/image`, formData).then((response) => response.data);
    }
}
export default new AdminService();