import AppError from './app.js';
class NotFoundError extends AppError {
    constructor(message = 'resource not found', meta = null) {
        super(message, 404, meta);
    }
}
export default NotFoundError;