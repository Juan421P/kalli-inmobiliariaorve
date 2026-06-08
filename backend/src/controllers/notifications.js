import model from '../models/notifications.js';
import { catchAsync } from '../utils/catch_async.js';
import NotFoundError from '../errors/not_found.js';

const RECIPIENT_TYPES = ['collaborator', 'buyer', 'owner'];
const ACTION_LINK_TYPES = ['property', 'appointment', 'offer'];
const CATEGORIES = ['status_change', 'new_message', 'reminder', 'system'];

const controller = {

    get: catchAsync(async (req, res) => {
        const notifications = await model.find({ 'recipient.id': req.user.id });
        return res.status(200).json({ notifications });
    }),

    getById: catchAsync(async (req, res) => {
        const notification = await model.findById(req.params.id);
        if (!notification) throw new NotFoundError('notification not found');
        return res.status(200).json({ notification });
    }),

    post: catchAsync(async (req, res) => {
        const { recipient, title, message, action_link, category } = req.body;

        if (!recipient?.type) return res.status(400).json({ message: 'recipient.type is required' });
        if (!RECIPIENT_TYPES.includes(recipient.type)) return res.status(400).json({ message: `recipient.type must be one of: ${RECIPIENT_TYPES.join(', ')}` });
        if (!recipient?.id) return res.status(400).json({ message: 'recipient.id is required' });
        if (!title?.trim()) return res.status(400).json({ message: 'title is required' });
        if (!message?.trim()) return res.status(400).json({ message: 'message is required' });
        if (!category) return res.status(400).json({ message: 'category is required' });
        if (!CATEGORIES.includes(category)) return res.status(400).json({ message: `category must be one of: ${CATEGORIES.join(', ')}` });

        if (action_link !== undefined) {
            if (!action_link?.type) return res.status(400).json({ message: 'action_link.type is required when action_link is provided' });
            if (!ACTION_LINK_TYPES.includes(action_link.type)) return res.status(400).json({ message: `action_link.type must be one of: ${ACTION_LINK_TYPES.join(', ')}` });
            if (!action_link?.target_id) return res.status(400).json({ message: 'action_link.target_id is required when action_link is provided' });
        }

        const notification = new model({ recipient, title: title.trim(), message: message.trim(), action_link, category });
        await notification.save();
        return res.status(201).json({ message: 'notification created successfully', notification });
    }),

    markRead: catchAsync(async (req, res) => {
        const notification = await model.findByIdAndUpdate(
            req.params.id,
            { is_read: true },
            { new: true }
        );
        if (!notification) throw new NotFoundError('notification not found');
        return res.status(200).json({ message: 'notification marked as read', notification });
    }),

    delete: catchAsync(async (req, res) => {
        const notification = await model.findByIdAndDelete(req.params.id);
        if (!notification) throw new NotFoundError('notification not found');
        return res.status(200).json({ message: 'notification deleted successfully' });
    })

};

export default controller;