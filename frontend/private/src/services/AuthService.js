import Service from './Service'
class AuthService extends Service {
    constructor() {
        super('/auth');
    }
    async me() {
        const response = await this.api.get(`${this.endpoint}/me`);
        return response.data;
    }
}
export default new AuthService();