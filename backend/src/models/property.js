import { Schema, model } from 'mongoose';
const schema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    property_type: { type: String, enum: ['house', 'apartment', 'land'], required: true },
    listing_type: { type: String, enum: ['sale', 'rent'], required: true },
    price: { type: Number, required: true },
    price_history: [{ type: Number }],
    status: { type: String, enum: ['available', 'occupied'], default: 'available' },
    address: { type: String },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    parking_spaces: { type: Number, default: 0 },
    allows_pets: { type: Boolean, default: false },
    area: {
        number: { type: Number, required: true },
        unit: { type: String, enum: ['v2', 'm2'], required: true }
    },
    furnished: { type: Boolean, default: false },
    appliances: [{ type: Schema.Types.ObjectId, ref: 'appliance' }],
    amenities: [{ type: Schema.Types.ObjectId, ref: 'amenity' }],
    features: [{ type: Schema.Types.ObjectId, ref: 'feature' }],
    images: [{ type: String }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'tag' }],
    owner: { type: Schema.Types.ObjectId, ref: 'client', required: true },
    collaborator: { type: Schema.Types.ObjectId, ref: 'collaborator' },
    views: { type: Number, default: 0 },
    availability: {
        since: { type: Date, default: Date.now }
    },
    public_id: { type: String, unique: true, required: true, index: true }
}, { timestamps: true });
schema.index({ location: '2dsphere' });
const p = model('property', schema);
export default p;