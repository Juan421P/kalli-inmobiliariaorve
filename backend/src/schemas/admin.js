import { z } from 'zod';
const a = z.object({
    name: z.string().min(1, 'name is required'),
    lastname: z.string().min(1, 'lastname is required'),
    password: z.string().min(8, 'password must be at least 8 characters long'),
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
export const register = a.omit({
    verified_email: true,
    verified_phone_number: true
});
export const login = a.pick({
    email: true,
    password: true
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