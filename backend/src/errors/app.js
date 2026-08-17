class AppError extends Error {
    constructor(message, status = 500, meta = null) {
        super(message);
        this.status = status;
        this.meta = meta;
        this.isOperational = true;
    }
}
export default AppError;