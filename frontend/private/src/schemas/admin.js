import { z } from 'zod';
// Tiene que calzar exacto con auth.password en el backend
// (backend/src/schemas/fields/primitives.js) — el login pasa por este mismo
// schema antes de comparar credenciales, así que si es más laxo que el
// backend, una contraseña mal tecleada (pero de 8+ caracteres) no da
// "credenciales incorrectas" sino un error de validación confuso.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const a = z.object({
    name: z.string().min(1, 'name is required'),
    lastname: z.string().min(1, 'lastname is required'),
    password: z.string()
        .min(8, 'la contraseña debe tener al menos 8 caracteres')
        .max(20, 'la contraseña no puede superar los 20 caracteres')
        .regex(PASSWORD_REGEX, 'la contraseña debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&)'),
    email: z.string().email('formato de correo inválido'),
    document: z.object({
        type: z.enum(['dui', 'pasaporte', 'residencia']),
        number: z.string().min(1, 'document number is required')
    }),
    phone: z.object({
        country_code: z.string().regex(/^\+\d+$/, 'must start with +'),
        number: z.string().regex(/^\d{4}-\d{4}$/, 'must be 0000-0000 format')
    }),
    verified_email: z.boolean(),
    verified_phone_number: z.boolean()
});
export const register = a.omit({
    verified_email: true,
    verified_phone_number: true
});
// El login NO reusa `a.shape.password`: ese regex es para crear/cambiar una
// contraseña. Login solo compara contra el hash con bcrypt (igual que
// backend/src/schemas/fields/auth.js -> loginPassword), así que exigir la
// complejidad acá bloqueaba el envío del formulario para cualquier cuenta
// cuya contraseña real no calzara con ese patrón (ej. un símbolo fuera de
// @$!%*?&), aunque las credenciales fueran correctas.
export const login = z.object({
    email: a.shape.email,
    password: z.string().min(1, 'la contraseña es requerida'),
});
export const update = a.omit({
    password: true,
    verified_email: true,
    verified_phone_number: true
}).partial();
export const changePassword = z.object({
    newPassword: a.shape.password,
    confirmPassword: a.shape.password
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: `passwords don't match`,
    path: ['confirmPassword'],
});
export const search = a.omit({ password: true }).partial();