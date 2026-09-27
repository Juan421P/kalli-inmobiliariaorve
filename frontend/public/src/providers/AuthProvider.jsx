import { useEffect, useState } from 'react'
import AuthContext from '@/contexts/AuthContext'
import AuthService from '@/services/Auth'

/**
 * Maneja la sesion del usuario para toda la app. La sesion real vive en
 * una cookie httpOnly que pone el backend al hacer login (ver services/auth.js,
 * withCredentials: true) — este provider no guarda tokens en el cliente,
 * solo refleja en memoria si esa cookie es valida o no.
 *
 * Al montar la app, `AuthService.me()` le pregunta al backend "quien soy
 * segun mi cookie" para poder rehidratar la sesion si el usuario refresca
 * la pagina o vuelve mas tarde, sin tener que loguearse de nuevo.
 * `isRehydrating` existe para que ProtectedRoute pueda esperar esa
 * respuesta antes de decidir si redirigir, evitando un redirect falso
 * mientras el /me todavia esta en vuelo.
 */
const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null)
    const [isRehydrating, setIsRehydrating] = useState(true)

    useEffect(() => {
        AuthService.me()
            // El backend acepta cookies de admin/cliente/colaborador (cada una
            // con su propio nombre, ver auth_cookie.js) para que las tres
            // puedan convivir en el mismo navegador. Pero este es el sitio
            // PUBLICO: si quien pregunta "quien soy" resulta ser admin o
            // colaborador (por una sesion del panel privado abierta en el
            // mismo navegador), no cuenta como "logueado" aca — si no,
            // el navbar muestra sesion activa y cualquier boton que dependa
            // de isAuthenticated manda a /profile solo para que el guard de
            // rol rebote de inmediato a inicio, sintiendose como que la
            // pagina se refresca sola.
            .then(({ role, user }) => setAuth(role === 'client' ? { role, user } : null))
            .catch(() => setAuth(null)) // sin cookie valida = no hay sesion, no es un error de UI
            .finally(() => setIsRehydrating(false))
    }, [])

    // login solo actualiza el estado en memoria: el login real (que pone
    // la cookie) ya ocurrio en el backend antes de llamar a esto.
    const login = ({ role, user }) => setAuth({ role, user })

    const updateUser = (updates) =>
        setAuth(prev => prev ? { ...prev, user: { ...prev.user, ...updates } } : prev)

    // logout SI necesita avisarle al backend: la cookie de sesion es httpOnly
    // (el JS del navegador no puede borrarla), asi que sin este POST la
    // sesion seguiria activa del lado del servidor aunque la UI muestre
    // "deslogueado". Limpiamos el estado local pase lo que pase la request,
    // para que el usuario nunca quede visualmente atascado como logueado.
    const logout = async () => {
        try {
            await AuthService.logout()
        } finally {
            setAuth(null)
        }
    }

    // Limpia solo el estado local, sin llamar a /client/logout. Necesario
    // para flujos donde el backend ya invalidó la cookie por su cuenta (ej.
    // "cerrar todas las sesiones"): llamar a logout() ahí pegaría otra vez a
    // una ruta que exige auth con una cookie que ya no existe, y esa petición
    // fallaría con 401 aunque el cierre de sesión ya haya funcionado.
    const clearSession = () => setAuth(null)

    return (
        <AuthContext.Provider value={{
            user: auth?.user ?? null,
            role: auth?.role ?? null,
            isAuthenticated: !!auth,
            isRehydrating,
            login,
            logout,
            clearSession,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthProvider