import model from '../models/notification.js';
import clientModel from '../models/client.js';
import collaboratorModel from '../models/collaborator.js';
import propertyModel from '../models/property.js';
import appointmentModel from '../models/appointment.js';
import NotFoundError from '../errors/not_found.js';
import ValidationError from '../errors/validation.js';

// tanto mmmm el comprador como el propietario apuntan a un cliente. Ok. Ocurre que
// esto no es un reflejo del rol que viene en el jwt, simplemente se usa para la lógica
// de negocio que está apunto de ocurrir aquí abajo
const modelsByRecipientType = {
    collaborator: collaboratorModel,
    buyer: clientModel,
    owner: clientModel,
};

const service = {

    // actor es req.user. Los usuarios que no son admin siempre estarán limitados a
    // sus propias notificaciones. Los administradores, además, pueden filtrar por destinatario
    // y ajá eso. O sin filtro y ver todas las notificaciones
    async getAll(actor, { recipientId, recipientType } = {}) {
        const filter = {};
        if (actor.role === 'admin') {
            if (recipientId) filter['recipient.id'] = recipientId;
            if (recipientType) filter['recipient.type'] = recipientType;
        } else {
            filter['recipient.id'] = actor.id;
        }
        return await model.find(filter).sort({ createdAt: -1 });
    },

    async getById(id) {
        const notification = await model.findById(id);
        if (!notification) throw new NotFoundError(
            'notification not found', {
            code: 'NOTIFICATION_NOT_FOUND',
            resource: 'notification',
            id
        });
        return notification;
    },

    // Utilizado internamente por otros servicios (eventualmente) para emitir notificaciones
    // como un efecto secundario de alguna mm acción en particular, NO solamente por la ruta
    // expuesta a un admin. Se mantiene como una sola cosa para que ambos endpoints tengan que
    // pasar por la misma validación. Más ordenado pues
    async create({ recipient, title, message, actionLink, category }) {
        const recipientModel = modelsByRecipientType[recipient.type];
        const recipientExists = await recipientModel.exists({ _id: recipient.id });
        if (!recipientExists) throw new NotFoundError(
            'recipient not found', {
            code: 'RECIPIENT_NOT_FOUND',
            resource: recipient.type,
            id: recipient.id
        });

        let action_link;
        if (actionLink) {
            if (actionLink.type === 'property') {
                const exists = await propertyModel.exists({ _id: actionLink.targetId });
                if (!exists) throw new NotFoundError(
                    'action_link target not found', {
                    code: 'ACTION_LINK_TARGET_NOT_FOUND',
                    resource: 'property',
                    id: actionLink.targetId
                });
            } else if (actionLink.type === 'appointment') {
                const exists = await appointmentModel.exists({ _id: actionLink.targetId });
                if (!exists) throw new NotFoundError(
                    'action_link target not found', {
                    code: 'ACTION_LINK_TARGET_NOT_FOUND',
                    resource: 'appointment',
                    id: actionLink.targetId
                });
            }
            action_link = { type: actionLink.type, target_id: actionLink.targetId };
        }

        return await model.create({
            recipient: { type: recipient.type, id: recipient.id },
            title: title.trim(),
            message: message.trim(),
            action_link,
            category,
        });
    },

    // creo que es full obvio qué ocurre aquí
    async markRead(id) {
        const notification = await model.findByIdAndUpdate(
            id,
            { is_read: true },
            { new: true }
        );
        if (!notification) throw new NotFoundError(
            'notification not found', {
            code: 'NOTIFICATION_NOT_FOUND',
            resource: 'notification',
            id
        });
        return notification;
    },

    async delete(id) {
        const notification = await model.findByIdAndDelete(id);
        if (!notification) throw new NotFoundError(
            'notification not found', {
            code: 'NOTIFICATION_NOT_FOUND',
            resource: 'notification',
            id
        });
        return { id, deleted: true };
    },
};
export default service;