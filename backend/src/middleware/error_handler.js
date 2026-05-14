import { logger } from '../utils/logger.js';
import HttpResponses from '../utils/http_responses.js';
export const errorHandler = (err, req, res, next) => {
    logger.error(`unhandled exception: ${err.message}`, err.stack);
    if (res.headersSent) {
        return next(err);
    }
    return HttpResponses.serverError(res, 'an internal server error occurred');
};