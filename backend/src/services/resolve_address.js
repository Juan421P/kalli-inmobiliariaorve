import { resolveAddress } from '../utils/resolve_address.js';

const service = {
    async resolve(coordinates) {
        const resolved = await resolveAddress(coordinates);
        return {
            address: resolved.formatted_address,
            components: {
                department: resolved.components.department,
                municipality: resolved.components.municipality,
                district: resolved.components.district,
            },
        };
    },
};
export default service;