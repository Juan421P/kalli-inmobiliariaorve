import { nextSequence } from './counter.js';
import { abbreviateDepartment, abbreviateRegion } from './abbreviate.js';

// Genera el identificador único de una propiedad usando la ubicación y un consecutivo independiente para cada combinación de regiones. Ejemplo: SS-SSC-SSV-0001
export const generatePropertyId = async (components, session = null) => {

    // Obtiene las abreviaturas de cada nivel de la ubicación.
    const department = abbreviateDepartment(components.department);
    const municipality = abbreviateRegion(components.municipality);
    const district = abbreviateRegion(components.district);

    const prefix = [department, municipality, district].join('-');

    // Obtiene el siguiente número disponible para este prefijo.
    const sequence = await nextSequence(prefix, session);

    // Completa el consecutivo con ceros a la izquierda.
    const number = String(sequence).padStart(4, '0');

    // When lo retornas :VVvvvVV
    return `${prefix}-${number}`;
};