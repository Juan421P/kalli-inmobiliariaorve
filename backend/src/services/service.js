class Service {
    constructor() { }
    async findAll(pagination = {}, filter = {}) {
        const page = parseInt(pagination.page, 10) || 1;
        const limit = parseInt(pagination.limit, 10) || 10;
        const skip = (page - 1) * limit;
        let sortQuery = '-createdAt';
        if (pagination.sort) sortQuery = pagination.sort.split(',').join(' ');
        const [data, total] = await Promise.all([
            this.model.find(filter).sort(sortQuery).skip(skip).limit(limit),
            this.model.countDocuments(filter)
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async findById(id) {
        return await this.model.findById(id);
    }
    async create(data) {
        return await this.model.create(data);
    }
    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
}
export default Service;