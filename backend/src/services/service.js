/**
 * Base service class that provides reusable database CRUD operations.
 *
 * Child services should extend this class and assign a Mongoose model
 * to "this.model".
 */
class Service {
    /**
     * Creates a service instance.
     */
    constructor() { }
    /**
    * Executes database operations inside a MongoDB transaction.
    *
    * Transactions ensure atomicity:
    * either all operations succeed and are committed,
    * or all changes are rolled back if an error occurs.
    *
    * The provided callback receives the active MongoDB session
    * and must pass it to every query participating in the transaction.
    *
    * Example:
    * await this.transaction(async (session) => {
    *     await User.create([data], { session });
    *     await Profile.create([profile], { session });
    * });
    *
    * @param {Function} work - Async callback containing transactional operations
    * @param {Object} work.session - MongoDB session injected into the callback
    * @returns {*} Result returned by the callback
    */
    async transaction(work) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const result = await work(session);
            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally { await session.endSession(); }
    }
    /**
     * Hook executed before findAll().
     *
     * @param {Object} pagination - Pagination options
     * @param {Object} filter - Query filter
     */
    async beforeFindAll(pagination, filter) { }
    /**
     * Hook executed after findAll().
     *
     * @param {Object} result - Query result
     */
    async afterFindAll(result) { }
    /**
     * Hook executed before findById().
     *
     * @param {string} id - Document ID
     */
    async beforeFindById(id) { }
    /**
     * Hook executed after findById().
     *
     * @param {Object|null} document - Retrieved document
     */
    async afterFindById(document) { }
    /**
     * Hook executed before create().
     *
     * @param {Object} data - Incoming document data
     */
    async beforeCreate(data) { }
    /**
     * Hook executed after create().
     *
     * @param {Object} document - Created document
     */
    async afterCreate(document) { }
    /**
     * Hook executed before update().
     *
     * @param {string} id - Document ID
     * @param {Object} data - Incoming update data
     */
    async beforeUpdate(id, data) { }
    /**
     * Hook executed after update().
     *
     * @param {Object|null} document - Updated document
     */
    async afterUpdate(document) { }
    /**
     * Hook executed before delete().
     *
     * @param {string} id - Document ID
     */
    async beforeDelete(id) { }
    /**
     * Hook executed after delete().
     *
     * @param {Object|null} document - Deleted document
     */
    async afterDelete(document) { }
    /**
     * Retrieves paginated data with optional filtering and sorting.
     *
     * @param {Object} [pagination={}] - Pagination options
     * @param {Object} [filter={}] - MongoDB filter object
     *
     * @returns {Object} Paginated query result
     */
    async findAll(pagination = {}, filter = {}, context = {}) {
        await this.beforeFindAll(pagination, filter, context);
        const page = parseInt(pagination.page, 10) || 1;
        const limit = parseInt(pagination.limit, 10) || 10;
        const skip = (page - 1) * limit;
        let sortQuery = '-createdAt';
        if (pagination.sort) {
            sortQuery = pagination.sort.split(',').join(' ');
        }
        const [data, total] = await Promise.all([
            this.model.find(filter).sort(sortQuery).skip(skip).limit(limit),
            this.model.countDocuments(filter)
        ]);
        const result = {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
        await this.afterFindAll(result, context);
        return result;
    }
    /**
     * Retrieves a document by ID.
     *
     * @param {string} id - Document ID
     * @returns {Object|null} Found document
     */
    async findById(id, context = {}) {
        await this.beforeFindById(id, context);
        const document = await this.model.findById(id);
        await this.afterFindById(document, context);
        return document;
    }
    /**
     * Creates a new document.
     *
     * @param {Object} data - Document data
     * @returns {Object} Created document
     */
    async create(data, context = {}) {
        await this.beforeCreate(data, context);
        const options = {};
        if (context.session) options.session = context.session;
        const document = await this.model.create(data, options);
        await this.afterCreate(document, context);
        return document;
    }
    /**
     * Updates a document by ID.
     *
     * @param {string} id - Document ID
     * @param {Object} data - Updated document data
     *
     * @returns {Object|null} Updated document
     */
    async update(id, data, context = {}) {
        await this.beforeUpdate(id, data, context);
        const options = { new: true, runValidators: true };
        if (context.session) options.session = context.session;
        const document = await this.model.findByIdAndUpdate(id, data, options);
        await this.afterUpdate(document, context);
        return document;
    }
    /**
     * Deletes a document by ID.
     *
     * @param {string} id - Document ID
     * @returns {Object|null} Deleted document
     */
    async delete(id, context = {}) {
        await this.beforeDelete(id, context);
        const options = {};
        if (context.session) options.session = context.session;
        const document = await this.model.findByIdAndDelete(id, options);
        await this.afterDelete(document, context);
        return document;
    }
}
export default Service;