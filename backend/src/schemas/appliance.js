import { z } from 'zod';
import { string } from './fields/primitives.js';
import { database } from './fields/index.js';

export const schemas = {

    queryById: z.object({ id: database.id }).strict(),

    create: z.object({ name: string({ min: 3, max: 60 }) }).strict(),

    update: z.object({ name: string({ min: 3, max: 60 }) }).strict(),

    merge: z.object({
        principal: database.id,
        references: z.array(database.id).min(1, 'at least one appliance to absorb is required'),
    }).strict().refine(
        data => !data.references.includes(data.principal),
        { path: ['references'], message: 'principal cannot also appear in references' }
    ),
};