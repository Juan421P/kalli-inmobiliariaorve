import service from '../services/resolve_address.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {
    post: catchAsync(async (req, res) => {
        const resolved = await service.resolve(req.body.coordinates);
        return res.status(200).json({ message: 'address resolved successfully', ...resolved });
    }),
};
export default controller;