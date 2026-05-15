import AppError from './app.js';
class InternalServerError extends AppError {
    constructor(message = 'internal server error', meta = null) {
        super(message, 500, meta);
    }
}
export default InternalServerError;