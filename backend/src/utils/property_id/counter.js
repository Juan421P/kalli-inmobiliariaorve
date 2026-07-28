import model from '../../models/counter.js';

// Incrementa y devuelve el siguiente consecutivo asociado a una clave. Si la clave no existe, la crea automáticamente.
export const nextSequence = async (key, session = null) => {
    const counter = await model.findOneAndUpdate(
        { key },
        { $inc: { value: 1 } },
        { new: true, upsert: true, session }
    );

    // When lo retornas :VVvvVVV
    return counter.value;
};