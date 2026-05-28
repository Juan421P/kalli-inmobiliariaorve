import AppError from '../errors/app.js';
export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) return res.status(400).json({ message: 'bad request' });
    console.error(err);
    return res.status(500).json({ message: 'internal server error' });
};