import { useEffect, useState } from 'react'
import AuthContext from '@/contexts/AuthContext'
import AuthService from '@/services/auth'

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
            .then(({ role, user }) => setAuth({ role, user }))
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
    )
}
export default AuthProvider