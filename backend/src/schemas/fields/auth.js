import { string, password, boolean } from './primitives.js';

// schemas enfocados en credenciales y tal
export const password = password();
export const token = string();
export const code = string({ min: 6, max: 6, regex: /^[a-zA-Z0-9]+$/ });
export const verifiedEmail = boolean();
export const verifiedPhone = boolean();