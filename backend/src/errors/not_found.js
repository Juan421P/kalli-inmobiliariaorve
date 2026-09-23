import AppError from './app.js';
class NotFoundError extends AppError {
    constructor(message = 'recurso no encontrado', meta = null) {
        super(message, 404, meta);
    }
}
export default NotFoundError;