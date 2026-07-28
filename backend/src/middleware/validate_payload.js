// Middleware genérico para validar la información de una petición con Zod. Permite validar body, params y query según se necesite en cada ruta. Si la validación es exitosa, reemplaza los datos originales por la versión ya validada y transformada por Zod.
export const validatePayload = ({ body, params, query }) => (req, res, next) => {
    try {
        // Valida el cuerpo de la petición.
        if (body) req.body = body.parse(req.body);

        // Valida los parámetros de la ruta.
        if (params) req.params = params.parse(req.params);

        // Valida los parámetros de consulta.
        if (query) req.query = query.parse(req.query);

        next();
    } catch (error) {
        // Cualquier error de validación se delega al manejador global.
        next(error);
    }
};