import AppError from './app.js';
class ValidationError extends AppError {
    constructor(message = 'validation error', meta = null) {
        super(message, 422, meta);
    }
}
export default ValidationError;