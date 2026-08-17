import { useEffect, useState } from 'react';
import AuthContext from '@/context/AuthContext';
import authService from '@/services/authService';
import clientService from '@/services/clientService';

/**
 * Maneja la sesion del usuario para toda la app. La sesion real vive en una
 * cookie httpOnly que pone el backend al hacer login (ver services/clientService.js),
 * este provider no guarda tokens en el cliente, solo refleja en memoria si esa
 * cookie es valida o no.
 *
 * Al montar la app, authService.me() le pregunta al backend "quien soy segun
 * mi cookie" para poder rehidratar la sesion sin que el usuario tenga que
 * loguearse de nuevo cada vez que abre la app. `isRehydrating` existe para que
 * las pantallas protegidas esperen esa respuesta antes de decidir si redirigir.
 */
const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [isRehydrating, setIsRehydrating] = useState(true);

    useEffect(() => {
        authService.me()
            .then(({ role, user }) => setAuth({ role, user }))
            .catch(() => setAuth(null))
            .finally(() => setIsRehydrating(false));
    }, []);

    const login = ({ role, user }) => setAuth({ role, user });

    const updateUser = (updates) =>
        setAuth((prev) => (prev ? { ...prev, user: { ...prev.user, ...updates } } : prev));

    // logout SI necesita avisarle al backend: la cookie es httpOnly, asi que
    // sin este POST la sesion seguiria activa del lado del servidor.
    const logout = async () => {
        try {
            await clientService.logout();
        } finally {
            setAuth(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user: auth?.user ?? null,
            role: auth?.role ?? null,
            isAuthenticated: !!auth,
            isRehydrating,
            login,
            logout,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
