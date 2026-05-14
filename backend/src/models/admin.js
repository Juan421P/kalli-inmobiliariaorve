import { Schema, model } from 'mongoose';
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
            match: [/^\+\d+$/, 'country code must start with + followed by numbers']
        },
        number: {
            type: String,
            required: true,
            match: [/^\d{4}-\d{4}$/, 'phone number must follow the format 0000-0000']
        }
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'invalid email address']
    },
    verified_email: {
        type: Boolean,
        default: true
    },
    verified_phone_number: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});
schema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
export default model('admin', schema);