import { z } from 'zod';

// Expresiones regulares para formatos específicos
const regexes = {
    mongoId: /^[a-f\d]{24}$/i,
    countryCode: /^\+\d+$/,
    phoneNumber: /^\d{4}-\d{4}$/, // formato de teléfono local (ej. 7003-4843)
    dui: /^\d{8}-\d$/, // formato del DUI (8 números, el guión, otro número)
    shortText: /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s'-]+$/,
    text: /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s.,()#'":-]+$/,
    longText: /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:!?()#'"¿¡%/-]+$/, // incluye más signos de puntuación y demás
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ // por lo menos 8 caracteres, 1 letra mayúscula, 1 letra minúscula, 1 número y 1 caracter especial
};

// schema base para cadenas de texto
// limpia espacios en blanco y permite definir límites de longitud varios
export const string = ({ trim = true, min = 1, max, regex } = {}) => {
    let schema = z.string();
    if (trim) schema = schema.trim();
    if (min !== undefined) schema = schema.min(min);
    if (max !== undefined) schema = schema.max(max);
    if (regex !== undefined) schema = schema.regex(regex);
    return schema;
};

// schema base para números
// ajá. Puede forzar enteros, positivos, o rangos específicos
export const number = ({ int = false, positive = false, min, max } = {}) => {
    let schema = z.number();
    if (int) schema = schema.int();
    if (positive) schema = schema.positive();
    if (min !== undefined) schema = schema.min(min);
    if (max !== undefined) schema = schema.max(max);
    return schema;
};

// schema para valores de verdadero o falso
export const boolean = () => z.boolean();

// schema para urls
export const url = () => z.url();

// schemas de texto especializado y para IDs de Mongo
export const mongoId = () => string({ regex: regexes.mongoId });
export const shortText = () => string({ max: 20, regex: regexes.shortText });
export const text = () => string({ max: 255, regex: regexes.text });
export const longText = () => string({ max: 1000, regex: regexes.longText });

// schema para correos electrónicos
export const email = () => string({ max: 255 }).email().transform(v => v.toLowerCase());

// schema para contraseñas
export const password = () => string({ min: 8, max: 20, regex: regexes.password });

// schemas para campos varios que están adaptados al formato local de aquí de El Salvador
export const dui = () => string({ regex: regexes.dui });
export const countryCode = () => string({ regex: regexes.countryCode });
export const phoneNumber = () => string({ regex: regexes.phoneNumber });

// schema compuesto para números de teléfono con su respectivo código de área
export const phone = () => z.object({ countryCode: countryCode(), number: phoneNumber() });

// schema compuesto para documento de identidad. Valida de forma condicional: si el tipo de documento seleccionado es 'dui', exige estrictamente el formato 00000000-0
export const document = () => z.object({
    type: z.enum(['dui', 'pasaporte', 'residencia']),
    number: string({ max: 50 }),
}).superRefine((data, ctx) => {
    if (data.type === 'dui' && !regexes.dui.test(data.number)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El formato del DUI debe ser 00000000-0",
            path: ['number'],
        });
    }
});

// yo me imagino que es algo evidente qué hace este ni lo voy a comentar
export const positiveNumber = () => number({ positive: true });

// Convierte un string JSON stringifeado a su valor original
// Útil en multipart/form-data porque los objetos y arreglos llegan como texto y ajá
export const jsonPreprocess = (schema) => z.preprocess((val) => {
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
    }
    return val;
}, schema);

// Convierte números enviados como string a number antes de validarlos
// Pensado principalmente para datos recibidos mediante multipart/form-data
export const coercedNumber = (opts) => z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? Number(val) : val),
    number(opts)
);

// Convierte los strings "true" y "false" a boolean
// Útil cuando multipart/form-data envía todos los valores como texto
export const coercedBoolean = () => z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : val),
    boolean()
);

export const coercedDate = () => z.coerce.date();

// Ya la carlitos el bolado este de form-data qué le costaba mandar los datos bien puya fok

// Para los datos geográficos
export const geojson = () => jsonPreprocess(z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90),
    ])
}));