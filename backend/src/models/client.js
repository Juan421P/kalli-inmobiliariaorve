import { Schema, model } from 'mongoose'; // ya
import bcrypt from 'bcryptjs';
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    document: {
        type: {
            type: String,
            required: true,
            enum: ['dui', 'pasaporte', 'residencia'],
            default: 'dui'
        },
        number: {
            type: String,
            required: true,
            unique: true,
            trim: true
        }
    },
    phone: {
        country_code: {
            type: String,
            required: true,
            match: [/^\+[1-9]\d{0,2}$/, 'el código de país debe iniciar con + seguido de 1 a 3 dígitos']
        },
        number: {
            type: String,
            required: true,
            match: [/^\d{4}-\d{4}$/, 'el número de teléfono debe seguir el formato 0000-0000']
        }
    },
    email: {
        type: String,
        required: [true, 'el correo electrónico es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'el correo electrónico no es válido']
    },
    verified_email: {
        type: Boolean,
        default: false
    },
    verified_phone_number: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'property',
        default: []
    }],
    picture: {
        type: String,
        trim: true
    },
    picture_id: {
        type: String,
        trim: true
    },
    // Se incluye en cada JWT emitido al iniciar sesión (ver services/client.js
    // login/verifyEmail). "Cerrar todas las sesiones" incrementa este número:
    // los tokens ya emitidos, que llevan el número anterior, dejan de ser
    // válidos aunque no hayan expirado (ver middleware/auth/require_auth.js).
    session_version: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
schema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});
schema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
export default model('client', schema);