import { onPropertyCreated } from '../../events/property/created.js';
import Mail from '../../utils/mail.js';
import { propertyCreated } from '../../utils/html/property_created.js';
import { config } from '../../../config.js';
onPropertyCreated(async ({ property }) => {
    const url = `${config.app.frontend_url}/properties/${property._id}`;
    await Mail.sendHtml(
        property.owner.email,
        'Your property has been listed',
        'Your property has been listed successfully',
        propertyCreated(property, url)
    );
});