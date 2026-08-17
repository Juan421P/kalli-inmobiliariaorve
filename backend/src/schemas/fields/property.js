import { z } from 'zod';
import { string, jsonPreprocess, coercedNumber, coercedBoolean, geojson, text } from './primitives.js';

export const propertyType = z.enum(['house', 'apartment', 'land']);
export const listingType = z.enum(['sale', 'rent']);
export const status = z.enum(['available', 'occupied']);

export const price = coercedNumber({ positive: true });
export const nonNegativeInt = coercedNumber({ int: true, min: 0 });
export const allowsPets = coercedBoolean();
export const furnished = coercedBoolean();

export const location = geojson();

export const area = jsonPreprocess(z.object({
    number: z.number().positive(),
    unit: z.enum(['v2', 'm2']),
}));

export const refIdArray = jsonPreprocess(z.array(z.string().regex(/^[a-f\d]{24}$/i)));
export const pictureIdArray = jsonPreprocess(z.array(string()));

export const addressComponents = jsonPreprocess(z.object({
    department: text(),
    municipality: text(),
    district: text(),
}));