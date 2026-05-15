import { Schema, model } from 'mongoose';
const schema = new Schema({
    key: { type: String, unique: true, required: true },
    value: { type: Number, default: 0 }
});
export default model('counter', schema);