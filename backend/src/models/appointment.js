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

    // Opcionales: el formulario público de "Agendar cita" ya no pide estos
    // datos (ver frontend hooks/useAppointmentForm.js); el staff los completa
    // después, desde el panel privado, al calificar al interesado.
    qualification: {
        funds_source: {
            type: String,
            enum: ['own', 'loan', 'mixed']
        },
        monthly_income: {
            type: Number,
            min: 0
        },
        reason: {
            type: String,
            trim: true
        }
    },

    current_address: {
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number], default: undefined }
        },
        address: { type: String },
        reference: {
            type: String,
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
            validate: { validator: v => timeRegex.test(v), message: 'el formato de la hora de inicio no es válido, use hh:mm AM/PM (ejemplo: 09:00 AM)' }
        },
        end_time: {
            type: String,
            required: true,
            validate: { validator: v => timeRegex.test(v), message: 'el formato de la hora de fin no es válido, use hh:mm AM/PM (ejemplo: 05:00 PM)' }
        }
    }
}, {
    timestamps: true
});

export default model('appointment', schema);