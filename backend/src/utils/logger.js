export const logger = {
    info: (message) => console.log(`[info] ${new Date().toISOString()} - ${message}`.toLowerCase()),
    warn: (message) => console.warn(`[warn] ${new Date().toISOString()} - ${message}`.toLowerCase()),
    error: (message, stack = '') => console.error(`[error] ${new Date().toISOString()} - ${message}`.toLowerCase(), stack)
};