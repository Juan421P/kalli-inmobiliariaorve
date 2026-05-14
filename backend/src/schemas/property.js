import { z } from 'zod';
const oid = z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid object id format');
const p = z.object({
    title: z.string().min(1, 'title is required'),
    description: z.string().min(1, 'description is required'),
    property_type: z.enum(['house', 'apartment', 'land']),
    listing_type: z.enum(['sale', 'rent']),
    price: z.number().positive('price must be greater than 0'),
    price_history: z.array(z.number()),
    status: z.enum(['available', 'occupied']),
    address: z.string(),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.array(z.number()).length(2, 'must have exactly [lng, lat]')
    }),
    bedrooms: z.number().nonnegative(),
    bathrooms: z.number().nonnegative(),
    parking_spaces: z.number().nonnegative(),
    allows_pets: z.boolean(),
    area: z.object({
        number: z.number().positive('area number must be greater than 0'),
        unit: z.enum(['v2', 'm2'])
    }),
    furnished: z.boolean(),
    appliances: z.array(oid),
    amenities: z.array(oid),
    features: z.array(oid),
    images: z.array(z.string().url('invalid url format')),
    tags: z.array(oid),
    owner: oid,
    collaborator: oid,
    views: z.number().nonnegative(),
    availability: z.object({
        since: z.string().datetime('invalid date format')
    })
});
export const create = p.omit({
    address: true,
    price_history: true,
    views: true
});
export const update = p.omit({
    address: true,
    price_history: true,
    views: true
}).partial();
export const search = p.omit({
    price_history: true,
    images: true,
    description: true
}).partial();