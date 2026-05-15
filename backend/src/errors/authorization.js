import AppError from './app.js';
class AuthorizationError extends AppError {
    constructor(message = 'forbidden', meta = null) {
        super(message, 403, meta);
    }
}
export default AuthorizationError;