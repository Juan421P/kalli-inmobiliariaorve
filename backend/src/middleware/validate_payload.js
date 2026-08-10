// Middleware genérico para validar la información de una petición con Zod. Permite validar body, params y query según se necesite en cada ruta. Si la validación es exitosa, reemplaza los datos originales por la versión ya validada y transformada por Zod.
export const validatePayload = ({ body, params, query }) => (req, res, next) => {
    try {
        // Valida el cuerpo de la petición.
        if (body) req.body = body.parse(req.body);

        // Valida los parámetros de la ruta.
        if (params) req.params = params.parse(req.params);

        // Valida los parámetros de consulta.
        // En Express 5, req.query es un getter sin setter en el prototipo,
        // por lo que se redefine como propiedad propia del request para poder reemplazarla.
        if (query) Object.defineProperty(req, 'query', {
            value: query.parse(req.query),
            writable: true,
            configurable: true,
            enumerable: true
        });

        next();
    } catch (error) {
        // Cualquier error de validación se delega al manejador global.
        next(error);
    }
};