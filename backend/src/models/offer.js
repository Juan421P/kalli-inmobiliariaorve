import { Schema, model } from 'mongoose';
const history = new Schema({
    price: { type: Number, required: true },
    actor: { type: String, enum: ['buyer', 'seller'], required: true }
}, { _id: false, timestamps: { createdAt: 'created_at', updatedAt: false } });
const schema = new Schema({
    buyer: { type: Schema.Types.ObjectId, ref: 'client', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'property', required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'countered', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
    move_in_date: { type: Date },
    rental_months: { type: String, enum: ['6', '12', '24', '36+'] },
    last_actor: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
    history: [history]
}, { timestamps: true });
export default model('offer', schema);