import { z } from 'zod';
import { database } from './fields/index.js';
import { coercedDate } from './fields/appointment.js';

const resolution_statuses = ['accepted', 'rejected', 'withdrawn'];
const rental_months = ['6', '12', '24', '36+'];

export const schemas = {

    queryById: z.object({ id: database.id }).strict(),

    queryFilter: z.object({
        search: z.string().trim().optional(),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(5),
        type: z.union([z.literal('all'), z.enum(['sale', 'rent'])]).default('all'),
    }).strict(),

    create: z.object({
        property: database.id,
        price: z.number().positive(),
        move_in_date: coercedDate().optional(),
        rental_months: z.enum(rental_months).optional(),
        buyer: database.id.optional(),
    }).strict(),

    counter: z.object({
        price: z.number().positive(),
    }).strict(),

    resolve: z.object({
        status: z.enum(resolution_statuses),
    }).strict(),

    update: z.object({
        move_in_date: coercedDate().optional(),
        rental_months: z.enum(rental_months).optional(),
    }).strict().refine(
        data => Object.keys(data).length > 0,
        { message: 'at least one field must be updated' }
    ),
};