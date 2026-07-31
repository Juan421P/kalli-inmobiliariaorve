import InternalServerError from './internal_server.js';
class CloudinaryError extends InternalServerError {
    constructor(message, meta = {}) {
        super(message, { code: 'CLOUDINARY_ERROR', ...meta });
    }
}
export default CloudinaryError;