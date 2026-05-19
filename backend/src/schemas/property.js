import { z } from 'zod';
import {
    oid,
    shortString,
    string,
    positiveNumber,
    nonNegativeNumber,
    boolean,
    json
} from '../utils/zod_types.js';
const coordinates = z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.coerce.number())
        .length(2, 'must have exactly [lng, lat]')
});
const area = z.object({
    number: positiveNumber,
    unit: z.enum(['v2', 'm2'])
});
const p = z.object({
    title: shortString,
    description: string,
    property_type: z.enum([
        'house',
        'apartment',
        'land'
    ]),
    listing_type: z.enum([
        'sale',
        'rent'
    ]),
    price: positiveNumber,
    status: z.enum([
        'available',
        'occupied'
    ]).optional(),
    location: json(coordinates),
    bedrooms: nonNegativeNumber.optional(),
    bathrooms: nonNegativeNumber.optional(),
    parking_spaces: nonNegativeNumber.optional(),
    allows_pets: boolean.optional(),
    area: json(area),
    furnished: boolean.optional(),
    appliances: json(
        z.array(oid)
    ).optional(),
    amenities: json(
        z.array(oid)
    ).optional(),
    features: json(
        z.array(oid)
    ).optional(),
    tags: json(
        z.array(oid)
    ).optional(),
    owner: oid,
    collaborator: oid.optional(),
    remove_pictures: json(
        z.array(z.string())
    ).optional()
});
export const create = p;
export const update = p.partial();
export const search = z.object({
    title: shortString.optional(),
    property_type: z.enum([
        'house',
        'apartment',
        'land'
    ]).optional(),
    listing_type: z.enum([
        'sale',
        'rent'
    ]).optional(),
    status: z.enum([
        'available',
        'occupied'
    ]).optional(),
    min_price: positiveNumber.optional(),
    max_price: positiveNumber.optional(),
    owner: oid.optional(),
    collaborator: oid.optional()
});