import { Schema, model } from 'mongoose';

// Formato aceptado: hh:mm AM/PM (ej. 09:00 AM, 12:30 PM)
const timeRegex = /^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/i;

const schema = new Schema({
    // Los días se guardan en inglés; el frontend los mapea a español al mostrarlos
    day: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },

    intervals: [{
        start_time: {
            type: String,
            required: true,
            validate: {
                validator: v => timeRegex.test(v),
                message: 'start time format is invalid, use hh:mm AM/PM (example: 09:00 AM)'
            }
        },

        end_time: {
            type: String,
            required: true,
            validate: {
                validator: v => timeRegex.test(v),
                message: 'end time format is invalid, use hh:mm AM/PM (example: 05:00 PM)'
            }
        }
    }]
}, {
    timestamps: true
});

export default model('schedule_availability', schema);
