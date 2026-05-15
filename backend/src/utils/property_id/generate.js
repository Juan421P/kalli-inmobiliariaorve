import { nextSequence } from './counter.js';
import { abbreviateDepartment, abbreviateRegion } from './abbreviate.js';
export const generatePropertyId = async (components, session = null) => {
    const department = abbreviateDepartment(components.department);
    const municipality = abbreviateRegion(components.municipality);
    const district = abbreviateRegion(components.district);
    const prefix = [department, municipality, district].join('-');
    const sequence = await nextSequence(prefix, session);
    const number = String(sequence).padStart(4, '0');
    return `${prefix}-${number}`;
};