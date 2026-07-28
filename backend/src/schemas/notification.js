import { z } from 'zod';
import { database } from './fields';
import { text, longText } from './fields/primitives.js';

const recipient_types = ['collaborator', 'buyer', 'owner'];
const action_link_types = ['property', 'appointment', 'offer'];
const categories = ['status_change', 'new_message', 'reminder', 'system'];

const recipient = z.object({
    type: z.enum(recipient_types),
    id: database.id,
});

const actionLink = z.object({
    type: z.enum(action_link_types),
    targetId: database.id,
});

export const schemas = {

    queryById: z.object({ id: database.id }).strict(),

    queryFilter: z.object({
        recipient_id: database.id.optional(),
        recipient_type: z.enum(recipient_types).optional(),
    }).strict(),

    create: z.object({
        recipient,
        title: text(),
        message: longText(),
        action_link: actionLink.optional(),
        category: z.enum(categories),
    }).strict(),
};

export { recipient_types, action_link_types, categories };