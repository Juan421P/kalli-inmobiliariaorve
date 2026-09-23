import AppError from './app';
class RateLimitError extends AppError {
    constructor(message = 'demasiadas solicitudes, intente de nuevo más tarde') {
        super(message, 429);
    }
}
export default RateLimitError;