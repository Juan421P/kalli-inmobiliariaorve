import AppError from './app.js';
/**
 *  este y el AuthenticationError pueden parecer similares.
    Con el objetivo de aclarar su funcionamiento:
    Este es para, digamos, un correo no verificado,
    código de verificación de correo o cambio de contraseña incorrecto,
    intentar editar recursos de otro usuario sin permisos correspondientes, etc.
 */
class AuthorizationError extends AppError {
    constructor(message = 'forbidden', meta = null) {
        super(message, 403, meta);
    }
}
export default AuthorizationError;