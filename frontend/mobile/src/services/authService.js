import api from './apiClient';

const authService = {
    // Le pregunta al backend "quien soy segun mi cookie de sesion" — se usa
    // para rehidratar la sesion cuando se abre la app (ver AuthProvider).
    me: () => api.get('/auth/me'),
};

export default authService;
