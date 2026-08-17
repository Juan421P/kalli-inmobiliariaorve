import { z } from 'zod';
const oid = z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid object id format');
const o = z.object({
    buyer: oid,
    property: oid,
    price: z.number().positive('price must be greater than 0'),
    status: z.enum(['pending', 'countered', 'accepted', 'rejected', 'withdrawn']),
    move_in_date: z.string().datetime().optional(),
    rental_months: z.enum(['6', '12', '24', '36+']).optional(),
    last_actor: z.enum(['buyer', 'seller']),
    history: z.array(z.object({
        price: z.number().positive(),
        actor: z.enum(['buyer', 'seller'])
    }))
});
export const create = o.omit({
    status: true,
    last_actor: true,
    history: true
});
export const counter = z.object({
    price: z.number().positive('counter price must be greater than 0')
});
export const resolve = z.object({
    status: z.enum(['accepted', 'rejected', 'withdrawn'])
});