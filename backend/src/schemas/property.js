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

    create: z.object({
        title: text(),
        description: longText(),
        propertyType,
        listingType,
        price,
        status: status.optional(),
        location,
        address: text(),
        addressComponents,
        bedrooms: nonNegativeInt.optional(),
        bathrooms: nonNegativeInt.optional(),
        parkingSpaces: nonNegativeInt.optional(),
        allowsPets: allowsPets.optional(),
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
        propertyType: propertyType.optional(),
        listingType: listingType.optional(),
        price: price.optional(),
        status: status.optional(),
        location: location.optional(),
        address: text().optional(),
        bedrooms: nonNegativeInt.optional(),
        bathrooms: nonNegativeInt.optional(),
        parkingSpaces: nonNegativeInt.optional(),
        allowsPets: allowsPets.optional(),
        area: area.optional(),
        furnished: furnished.optional(),
        appliances: refIdArray.optional(),
        amenities: refIdArray.optional(),
        features: refIdArray.optional(),
        tags: refIdArray.optional(),
        collaborator: database.id.optional(),
        removePictures: pictureIdArray.optional(),
    }).strict()
        .refine(data => Object.keys(data).length > 0, { message: 'at least one field must be updated' })
        .refine(data => !(data.location && !data.address), { path: ['address'], message: 'address is required whenever location changes' }),
};