import AppError from '../errors/app.js';
import { translateError } from '../utils/error_translator.js';

// Middleware global para manejar todos los errores de la aplicación. Los errores esperados (AppError) responden con su información. Cualquier otro error se registra en consola y devuelve un 500 genérico.
export const errorHandler = (err, req, res, next) => {
    // Error controlado por la aplicación, ya sea directamente o por el
    // traductor ese perrito que se aventó el claude
    const resolved = err instanceof AppError ? err : translateError(err);
    if (resolved instanceof AppError) return res.status(resolved.status).json(
        { message: resolved.message, meta: resolved.meta }
    );

    // Error inesperado.
    console.error(err);
    return res.status(500).json({
        message: 'internal server error',
    });
};