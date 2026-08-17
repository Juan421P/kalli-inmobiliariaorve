import AppError from './app.js';
/**
 *  este y el AuthorizationError pueden parecer similares.
    Con el objetivo de aclarar su funcionamiento:
    Este es para credenciales inválidas, jwts expirados,
    cookies que hagan falta, sesiones inválidas, etc.
 */
class AuthenticationError extends AppError {
    constructor(message = 'unauthorized') {
        super(message, 401);
    }
}
export default AuthenticationError;