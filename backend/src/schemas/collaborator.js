import { z } from 'zod';
import {
    name,
    email,
    password,
    phoneNumber,
    countryCode,
    boolean,
    json
} from '../utils/zod_types.js';
const c = z.object({
    name,
    lastname: name,
    password,
    email,
    document: json(z.object({
        type: z.enum(['dui', 'pasaporte', 'residencia']),
        number: z.string()
            .trim()
            .min(1, 'document number is required')
    })),
    phone: json(z.object({
        country_code: countryCode,
        number: phoneNumber
    })),
    verified_email: boolean,
    verified_phone_number: boolean
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
    newPassword: password,
    confirmPassword: password
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: `passwords don't match`,
    path: ['confirmPassword']
});
export const search = c.omit({
    password: true
}).partial();