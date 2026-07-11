import AppError from './app';
class RateLimitError extends AppError {
    constructor(message = 'too many requests') {
        super(message, 429);
    }
}
export default RateLimitError;