import AppError from '../errors/app.js';

// Middleware global para manejar todos los errores de la aplicación. Los errores esperados (AppError) responden con su información. Cualquier otro error se registra en consola y devuelve un 500 genérico.
export const errorHandler = (err, req, res, next) => {
    // Error controlado por la aplicación.
    if (err instanceof AppError) {
        return res.status(err.status).json({
            message: err.message,
            meta: err.meta,
        });
    }

    // Error inesperado.
    console.error(err);
    return res.status(500).json({
        message: 'internal server error',
    });
};