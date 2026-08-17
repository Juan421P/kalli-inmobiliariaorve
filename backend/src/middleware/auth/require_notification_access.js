import service from '../../services/notification.js';

export const requireNotificationAccess = async (req, res, next) => {
    try {
        const notification = await service.getById(req.params.id);
        const isAdmin = req.user.role === 'admin';
        const isRecipient = String(notification.recipient.id) === req.user.id;
        if (!isAdmin && !isRecipient) return res.status(403).json(
            { message: 'you do not have access to this notification' }
        );
        req.notification = notification;
        next();
    } catch (error) {
        next(error);
    }
}