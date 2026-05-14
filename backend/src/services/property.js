import Service from './service.js';
import model from '../models/property.js';
import axios from 'axios';
import { config } from '../../config.js';
class PropertyService extends Service {
    constructor() {
        super();
        this.model = model;
    }
    async _resolveAddress(coordinates) {
        const response = await axios.post(`${config.apis.address}/address`, { coordinates });
        return response.data.data.formatted_address;
    }
    async create(data) {
        if (data.location?.coordinates) data.address = await this._resolveAddress(data.location.coordinates);
        return await this.model.create(data);
    }
    async update(id, data) {
        if (data.location?.coordinates) data.address = await this._resolveAddress(data.location.coordinates);
        if (data.price) {
            const current = await this.model.findById(id);
            if (current && current.price !== data.price) data.$push = { price_history: current.price };
        }
        return await this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async incrementViews(id) { return await this.model.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }); }
}
export default new PropertyService();