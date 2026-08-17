import axios from 'axios';
import { config } from '../../config.js';
import InternalServerError from '../errors/internal_server.js';

export async function resolveAddress(coordinates) {
    try {
        const response = await axios.post(`${config.app.address_api}/address`, { coordinates });
        return response.data.data;
    } catch (err) {
        throw new InternalServerError(
            'failed to resolve address from coordinates',
            { code: 'ADDRESS_RESOLUTION_FAILED' }
        );
    }
}