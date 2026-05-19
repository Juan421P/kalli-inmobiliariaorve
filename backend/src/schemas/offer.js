import { z } from 'zod';
import {
    oid,
    positiveNumber,
    json,
    date
} from '../utils/zod_types.js';
const history = z.object({
    price: positiveNumber,
    actor: z.enum(['buyer', 'seller'])
});
const o = z.object({
    buyer: oid,
    property: oid,
    price: positiveNumber,
    status: z.enum([
        'pending',
        'countered',
        'accepted',
        'rejected',
        'withdrawn'
    ]),
    move_in_date: date.optional(),
    rental_months: z.enum([
        '6',
        '12',
        '24',
        '36+'
    ]).optional(),
    last_actor: z.enum([
        'buyer',
        'seller'
    ]),
    history: json(z.array(history))
});
export const create = o.omit({
    status: true,
    last_actor: true,
    history: true
});
export const counter = z.object({
    price: positiveNumber
});
export const resolve = z.object({
    status: z.enum([
        'accepted',
        'rejected',
        'withdrawn'
    ])
});