import model from '../../models/counter.js';
export const nextSequence = async (key, session = null) => {
    const counter = await model.findOneAndUpdate(
        { key },
        { $inc: { value: 1 } },
        { new: true, upsert: true, session }
    );
    return counter.value;
};