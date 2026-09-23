import AppError from './app.js';
class InternalServerError extends AppError {
    constructor(message = 'error interno del servidor', meta = null) {
        super(message, 500, meta);
    }
}
export default InternalServerError;