import AppError from './app.js';
class ConflictError extends AppError {
    constructor(message = 'conflict', meta = null) {
        super(message, 409, meta);
    }
}
export default ConflictError;