// Envuelve una función asíncrona para capturar automáticamente cualquier error y enviarlo al middleware de manejo de errores de Express. Así los controladores se ven más chulis porque no tienen el montón de try/catch y tal
export const catchAsync = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};