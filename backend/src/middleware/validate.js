import HttpResponses from '../utils/http_responses.js';
export const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        const formattedErrors = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
        return HttpResponses.badRequest(
            res,
            'validation failed',
            formattedErrors
        );
    }
};