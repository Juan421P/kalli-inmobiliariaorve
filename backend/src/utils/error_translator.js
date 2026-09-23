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
            'los datos enviados no son válidos',
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
            'los datos enviados no son válidos',
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
            `el valor enviado para el campo "${err.path}" no es válido`,
            { code: 'INVALID_FIELD_VALUE', field: err.path, value: err.value }
        );
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue ?? {})[0];
        // mensaje específico para los campos únicos más comunes, en vez de un
        // "ya existe" genérico que no dice qué dato es el que choca
        const label = {
            email: 'este correo electrónico',
            'document.number': 'este número de documento',
        }[field] ?? `este valor en el campo "${field}"`;
        return new ConflictError(
            `ya existe un registro con ${label}`,
            { code: 'DUPLICATE_KEY', field, value: err.keyValue?.[field] }
        );
    }

    if (err instanceof multer.MulterError) {
        const messages = {
            LIMIT_FILE_SIZE: 'el archivo supera el tamaño máximo permitido',
            LIMIT_UNEXPECTED_FILE: 'el archivo enviado no es del tipo esperado',
        };
        return new ValidationError(
            messages[err.code] ?? 'no se pudo procesar el archivo enviado',
            { code: `MULTER_${err.code}`, field: err.field }
        );
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return new AuthenticationError(
            'la sesión es inválida o ha expirado'
        );
    }

    return null;
};