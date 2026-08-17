import { z } from 'zod';
import { database } from './fields/index.js';
import {
    propertyType, listingType, status, price, nonNegativeInt,
    allowsPets, furnished, location, area, refIdArray, pictureIdArray, addressComponents
} from './fields/property.js';
import { text, longText } from './fields/primitives.js';

export const schemas = {

    queryById: z.object({ id: database.id }).strict(),
    queryByPublicId: z.object({ public_id: text() }).strict(),

    nearby: z.object({
        lat: z.coerce.number().min(-90).max(90),
        lng: z.coerce.number().min(-180).max(180),
        radius: z.coerce.number().positive().max(50000).default(5000), // metros, tope 50km
    }).strict(),

    byRegion: z.object({
        department: text().optional(),
        municipality: text().optional(),
        district: text().optional(),
    }).strict().refine(
        data => Object.keys(data).length > 0,
        { message: 'at least one region field is required' }
    ),

    create: z.object({
        title: text(),
        description: longText(),
        property_type: propertyType,
        listing_type: listingType,
        price,
        status: status.optional(),
        location,
        address: text(),
        address_components: addressComponents,
        bedrooms: nonNegativeInt.optional(),
        bathrooms: nonNegativeInt.optional(),
        parking_spaces: nonNegativeInt.optional(),
        allows_pets: allowsPets.optional(),
        area,
        furnished: furnished.optional(),
        appliances: refIdArray.optional(),
        amenities: refIdArray.optional(),
        features: refIdArray.optional(),
        tags: refIdArray.optional(),
        owner: database.id,
        collaborator: database.id.optional(),
    }).strict(),

    update: z.object({
        title: text().optional(),
        description: longText().optional(),
        property_type: propertyType.optional(),
        listing_type: listingType.optional(),
        price: price.optional(),
        status: status.optional(),
        location: location.optional(),
        address: text().optional(),
        bedrooms: nonNegativeInt.optional(),
        bathrooms: nonNegativeInt.optional(),
        parking_spaces: nonNegativeInt.optional(),
        allows_pets: allowsPets.optional(),
        area: area.optional(),
        furnished: furnished.optional(),
        appliances: refIdArray.optional(),
        amenities: refIdArray.optional(),
        features: refIdArray.optional(),
        tags: refIdArray.optional(),
        collaborator: database.id.optional(),
        remove_pictures: pictureIdArray.optional(),
    }).strict()
        .refine(data => Object.keys(data).length > 0, { message: 'at least one field must be updated' })
        .refine(data => !(data.location && !data.address), { path: ['address'], message: 'address is required whenever location changes' }),
};