import AppError from './app.js';
class AuthenticationError extends AppError {
    constructor(message = 'unauthorized') {
        super(message, 401);
    }
}
export default AuthenticationError;