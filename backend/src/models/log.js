import { Schema, model } from 'mongoose';
const schema = new Schema({
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entity_id: { type: Schema.Types.ObjectId, required: true, index: true },
    actor: { type: Schema.Types.ObjectId, refPath: 'actor_model', default: null },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });
schema.index({ entity: 1, entity_id: 1 });
schema.index({ actor: 1, createdAt: -1 });
export default model('log', schema);