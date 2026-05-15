import HttpResponses from '../utils/http_responses.js';
import AppError from '../errors/app.js';
export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) return HttpResponses.custom(
        res,
        err.status,
        false,
        err.message,
        null,
        err,
        err.meta
    );
    console.error(err);
    return HttpResponses.serverError(
        res,
        'internal server error'
    );
};