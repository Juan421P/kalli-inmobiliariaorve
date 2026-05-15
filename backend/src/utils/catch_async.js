/**
 * Wraps an async Express route handler and automatically forwards
 * any thrown errors or rejected Promises to Express error middleware.
 * This avoids repeating try/catch blocks inside every controller method.
 * @param {Function} fn Async Express middleware or controller function with signature (req, res, next)
 * @returns {Function} Express middleware function that executes the async handler and catches any async errors
 */
export const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};