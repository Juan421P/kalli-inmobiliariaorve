import { Schema, model } from 'mongoose';

const timeRegex = /^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/i;

const schema = new Schema({
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'client',
        required: true
    },

    property: {
        type: Schema.Types.ObjectId,
        ref: 'property',
        required: true
    },

    qualification: {
        funds_source: {
            type: String,
            required: true,
            enum: ['own', 'loan', 'mixed']
        },
        monthly_income: {
            type: Number,
            required: true,
            min: 0
        },
        reason: {
            type: String,
            required: true,
            trim: true
        }
    },

    // Mirrors property's own location/address shape instead of pointing at
    // a district collection that never existed.
    current_address: {
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }
        },
        address: { type: String }, // resolved server-side from coordinates
        reference: {
            type: String,
            required: true,
            trim: true
        }
    },

    proposed_dates: {
        type: [Date],
        required: true
    },

    scheduled_date: {
        type: Date
    },

    collaborator: {
        type: Schema.Types.ObjectId,
        ref: 'collaborator'
    },

    status: {
        type: String,
        enum: ['pending', 'assigned', 'scheduled', 'completed', 'cancelled'],
        default: 'pending'
    },

    notes: {
        type: String,
        trim: true
    },

    time: {
        start_time: {
            type: String,
            required: true,
            validate: { validator: v => timeRegex.test(v), message: 'start time format is invalid, use hh:mm AM/PM (example: 09:00 AM)' }
        },
        end_time: {
            type: String,
            required: true,
            validate: { validator: v => timeRegex.test(v), message: 'end time format is invalid, use hh:mm AM/PM (example: 05:00 PM)' }
        }
    }
}, {
    timestamps: true
});

export default model('appointment', schema);