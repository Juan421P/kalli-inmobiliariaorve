import Service from './Service'

class AuthService extends Service {
    constructor() {
        super('/auth')
    }

    async me() {
        const response = await this.api.get(`${this.endpoint}/me`)
        return response.data
    }

    // La cookie de sesion la limpia el backend en /client/logout (no hay un
    // /auth/logout generico todavia). Vive aca y no en un service de "client"
    // porque conceptualmente es parte del flujo de autenticacion.
    async logout() {
        const response = await this.api.post('/client/logout')
        return response.data
    }
}

export default new AuthService()
