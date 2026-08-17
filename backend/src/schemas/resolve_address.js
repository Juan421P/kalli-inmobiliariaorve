import { z } from 'zod';
export const schemas = {
    resolve: z.object({
        coordinates: z.tuple([
            z.number().min(-180).max(180),
            z.number().min(-90).max(90),
        ]),
    }).strict(),
};