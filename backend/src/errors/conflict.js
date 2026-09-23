import AppError from './app.js';
class ConflictError extends AppError {
    constructor(message = 'conflicto con un recurso existente', meta = null) {
        super(message, 409, meta);
    }
}
export default ConflictError;