import { Schema, model } from 'mongoose';
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

export default model('amenity', schema);