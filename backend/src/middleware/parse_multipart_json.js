// El frontend manda todo como texto plano bajo multipart/form-data, así que los campos
// anidados (document, phone, location, etc.) llegan como JSON.stringify(...).
// Este middleware los reconvierte a objeto/arreglo ANTES de que Zod los valide, así los
// schemas se escriben igual sin importar si la petición viene en JSON puro o en multipart.
// Particularmente útil por las colecciones que tienen que mandar imágenes y ajá eso.
export const parseMultipartJSON = (req, res, next) => {
    // Si no hay req.body o si no es un objeto pasa al siguiente middleware así como si nada
    if (!req.body || typeof req.body !== 'object') return next();
    // Se itera por cada una de las propiedades en req.body. Es que tienen la sintaxis esa
    // peculiar que es como object[property] como si fuera un posición en un arreglo
    for (const key of Object.keys(req.body)) {
        const value = req.body[key];
        // Si el valor de la propiedad actual no es una cadena de texto pues no hará falta
        // el parse así que saltamos a la siguiente iteración yupiii
        if (typeof value !== 'string') continue;
        // Se erradican. Fulminan. Pulverizan. Destruyen. Evaporizan. Los espacios en blanco
        const trimmed = value.trim();
        // Se verifica si la cadena comienza con '{' o con '[' (posibles objetos / arreglos).
        // Así se evita intentar convertir a json un string normal tipo el nombre y ajá
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                // Ya se intenta hacer el parse. Y se sobreescribe la propiedad del req.body.
                req.body[key] = JSON.parse(trimmed);
            } catch {
                // Si JSON.parse falla (tipo si era texto malformado o algo) se ignora el
                // error así mmm de manera silenciosa y ajá se deja como estaba no se cambia
            }
        }
    }
    next();
};