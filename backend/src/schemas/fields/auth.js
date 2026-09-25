import { string, password as p, boolean } from './primitives.js';

// schemas enfocados en credenciales y tal
export const password = p();
// El login solo compara contra el hash guardado (bcrypt.compare), no crea ni
// cambia ninguna contraseña — exigirle el regex de complejidad de auth.password
// (mayuscula+minuscula+numero+simbolo) rechaza el intento de login ANTES de
// siquiera consultar la base de datos si la contraseña real de esa cuenta no
// calza con el regex actual (ej. tiene un simbolo fuera de @$!%*?&, o se creo
// antes de que existiera esta regla). Se usa un string simple aca; la
// complejidad ya se exige donde corresponde: registro y cambio de contraseña.
export const loginPassword = string({ min: 1, max: 100 });
export const token = string();
export const code = string({ min: 6, max: 6, regex: /^[a-zA-Z0-9]+$/ });
export const verifiedEmail = boolean();
export const verifiedPhone = boolean();