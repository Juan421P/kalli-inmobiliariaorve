import { Schema, model } from 'mongoose';

const schema = new Schema({
    recipient: {
        type: {
            type: String,
            enum: ['collaborator', 'buyer', 'owner'],
            required: true
        },
        id: {
            type: Schema.Types.ObjectId,
            required: true
        }
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    action_link: {
        type: {
            type: String,
            enum: ['property', 'appointment', 'offer']
        },
        target_id: {
            type: Schema.Types.ObjectId
        }
    },
    is_read: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['status_change', 'new_message', 'reminder', 'system'],
        required: true
    }
}, {
    timestamps: true
});

export default model('notification', schema);