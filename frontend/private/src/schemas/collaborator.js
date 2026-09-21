import { z } from 'zod';
// Tiene que calzar exacto con auth.password en el backend
// (backend/src/schemas/fields/primitives.js) — el login pasa por este mismo
// schema antes de comparar credenciales, así que si es más laxo que el
// backend, una contraseña mal tecleada (pero de 8+ caracteres) no da
// "credenciales incorrectas" sino un error de validación confuso.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const c = z.object({
    name: z.string().min(1, 'name is required'),
    lastname: z.string().min(1, 'lastname is required'),
    password: z.string()
        .min(8, 'la contraseña debe tener al menos 8 caracteres')
        .max(20, 'la contraseña no puede superar los 20 caracteres')
        .regex(PASSWORD_REGEX, 'la contraseña debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&)'),
    email: z.string().email('invalid email format'),
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
export const register = c.omit({
    verified_email: true,
    verified_phone_number: true
});
export const login = c.pick({
    email: true,
    password: true
});
export const update = c.omit({
    password: true,
    verified_email: true,
    verified_phone_number: true
}).partial();
export const changePassword = z.object({
    newPassword: c.shape.password,
    confirmPassword: c.shape.password
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: `passwords don't match`,
    path: ['confirmPassword'],
});
export const search = c.omit({ password: true }).partial();