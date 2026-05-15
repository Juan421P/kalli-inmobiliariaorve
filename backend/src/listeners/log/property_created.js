import { onPropertyCreated } from '../../events/property/created.js';
import model from '../../models/log.js';
onPropertyCreated(async ({ property, actor }) => {
    await model.create({
        action: 'property.created',
        entity: 'property',
        entity_id: property._id,
        actor: actor,
        metadata: {
            public_id: property.public_id,
            price: property.price,
            listing_type: property.listing_type,
            property_type: property.property_type
        }
    });
});