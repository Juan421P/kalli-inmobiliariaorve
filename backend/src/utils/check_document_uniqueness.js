import admin from '../models/admin.js';
import client from '../models/client.js';
import collaborator from '../models/collaborator.js';
import ConflictError from '../errors/conflict.js';

export const checkDocumentUniqueness = async (documentNumber, { excludeId, excludeCollection } = {}) => {
    // Busca el número de documento en las tres colecciones al mismo tiempo.
    // Normalmente usamos el await y tal pero como estas búsquedas no dependen entre sí, se ejecutan al mismo tiempo con Promise.all para evitar esperar una por una. Entonces el proceso es un tantito más rápido aaaaaah qué chivo va.
    const [existingAdmin, existingClient, existingCollaborator] = await Promise.all([
        admin.findOne({ 'document.number': documentNumber }),
        client.findOne({ 'document.number': documentNumber }),
        collaborator.findOne({ 'document.number': documentNumber }),
    ]);

    // Filtra únicamente los registros encontrados.
    // Si se está actualizando un registro, ignora el documento que pertenece
    // a la misma colección y al mismo id.
    const matches = [
        { collection: 'admin', doc: existingAdmin },
        { collection: 'client', doc: existingClient },
        { collection: 'collaborator', doc: existingCollaborator },
    ].filter(({ collection, doc }) =>
        doc &&
        !(excludeId &&
            excludeCollection === collection &&
            String(doc._id) === String(excludeId))
    );

    // Si el documento ya existe en cualquier colección, tira error de conflicto
    if (matches.length > 0) {
        throw new ConflictError(
            'document number already registered',
            {
                code: 'DOCUMENT_NUMBER_ALREADY_EXISTS',
                field: 'document.number',
                value: documentNumber,
                existing_in: matches.map(m => m.collection),
            }
        );
    }
};