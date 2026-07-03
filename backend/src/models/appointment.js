import { Schema, model } from 'mongoose';

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

    current_address: {
        district: {
            type: Schema.Types.ObjectId,
            ref: 'district',
            required: true
        },

        reference: {
            type: String,
            required: true,
            trim: true
        }
    },

    // El cliente propone varias fechas; el colaborador elige una y la guarda en scheduled_date
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

    // Flujo: pending -> assigned (se asigna colaborador) -> scheduled (fecha confirmada) -> completed / cancelled
    status: {
        type: String,
        enum: [
            'pending',
            'assigned',
            'scheduled',
            'completed',
            'cancelled'
        ],
        default: 'pending'
    },

    notes: {
        type: String,
        trim: true
    },

    // Slot de horario disponible que el cliente seleccionó al agendar
    time: {
        type: Schema.Types.ObjectId,
        ref: 'time',
        required: true
    }
}, {
    timestamps: true
});

export default model('appointment', schema);