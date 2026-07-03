import AppError from '../errors/app.js';
export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) return res.status(err.status).json({ message: err.message, error: err });
    console.error(err);
    return res.status(500).json({ message: 'internal server error' });
};