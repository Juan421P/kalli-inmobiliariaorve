import InternalServerError from './internal_server.js';
class NodemailerError extends InternalServerError {
    constructor(message, meta = {}) {
        super(message, { code: 'NODEMAILER_ERROR', ...meta });
    }
}
export default NodemailerError;