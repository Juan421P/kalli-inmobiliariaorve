import { z } from 'zod';
import { database } from './fields/index.js';
import { day, intervals } from './fields/schedule_availability.js';

export const schemas = {

    queryById: z.object({ id: database.id }).strict(),

    create: z.object({ day, intervals }).strict(),

    update: z.object({
        day: day.optional(),
        intervals: intervals.optional(),
    }).strict().refine(
        data => Object.keys(data).length > 0,
        { message: 'at least one field must be updated' }
    ),
};