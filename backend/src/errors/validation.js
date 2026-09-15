import AppError from './app.js';
class ValidationError extends AppError {
    constructor(message = 'error de validación', meta = null) {
        super(message, 422, meta);
    }
}
export default ValidationError;