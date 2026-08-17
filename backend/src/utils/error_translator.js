import { ZodError } from 'zod';
import multer from 'multer';
import ValidationError from '../errors/validation.js';
import ConflictError from '../errors/conflict.js';
import AuthenticationError from '../errors/authentication.js';

// Convierte errores "crudos" (que nunca pasaron por un service/controller,
// como los de Zod, Mongoose o Multer) en AppError con metadata útil para el
// frontend. Devuelve null si el error no se reconoce, y el errorHandler ya luego
// ve qué pex o qué
export const translateError = (err) => {

    if (err instanceof ZodError) {
        return new ValidationError(
            'validation failed',
            {
                code: 'VALIDATION_FAILED',
                fields: err.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            }
        );
    }

    if (err.name === 'ValidationError' && err.errors) {
        return new ValidationError(
            'validation failed',
            {
                code: 'VALIDATION_FAILED',
                fields: Object.entries(err.errors).map(([field, e]) => ({
                    field,
                    message: e.message,
                })),
            }
        );
    }

    if (err.name === 'CastError') {
        return new ValidationError(
            `invalid value for field ${err.path}`,
            { code: 'INVALID_FIELD_VALUE', field: err.path, value: err.value }
        );
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue ?? {})[0];
        return new ConflictError(
            `${field} already exists`,
            { code: 'DUPLICATE_KEY', field, value: err.keyValue?.[field] }
        );
    }

    if (err instanceof multer.MulterError) {
        return new ValidationError(
            err.message,
            { code: `MULTER_${err.code}`, field: err.field }
        );
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return new AuthenticationError(
            'invalid or expired session',
            { code: 'INVALID_SESSION' }
        );
    }

    return null;
};