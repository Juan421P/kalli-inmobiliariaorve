import { z } from 'zod';
export const oid = z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid object id format');
export const string = z.string().trim().min(1, 'value is required').max(5000, 'value is too long').regex(/^[^<>|{}[\]\\`]+$/, 'contains invalid characters');
export const shortString = z.string().trim().min(1, 'value is required').max(120, 'value is too long').regex(/^[a-zA-ZÀ-ÿ0-9\s.,:;()#'"&\-_/]+$/, 'contains invalid characters');
export const name = z.string().trim().min(1, 'name is required').max(60, 'name is too long').regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'name contains invalid characters');
export const email = z.string().trim().toLowerCase().email('invalid email format').max(120, 'email is too long').regex(/^(?!.*[<>|{}[\]\\`]).+$/, 'email contains invalid characters');
export const password = z.string().min(8, 'password must be at least 8 characters long').max(25, 'password is too long').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&._\-#]+$/, 'password must contain uppercase, lowercase and number');
export const phoneNumber = z.string().regex(/^\d{4}-\d{4}$/, 'must be 0000-0000 format');
export const countryCode = z.string().regex(/^\+\d+$/, 'must start with +');
export const positiveNumber = z.coerce.number().positive('must be greater than 0');
export const nonNegativeNumber = z.coerce.number().nonnegative('cannot be negative');
export const boolean = z.coerce.boolean();
export const date = z.coerce.date();
export const json = (schema) => z.preprocess((value) => {
    if (typeof value === 'string') {
        try { return JSON.parse(value); }
        catch { return value; }
    }
    return value;
}, schema);