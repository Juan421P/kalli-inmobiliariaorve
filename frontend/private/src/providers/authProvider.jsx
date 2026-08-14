import { useEffect, useState } from 'react'
import AuthContext from '@/contexts/authContext'
import AuthService from '@/services/AuthService'
const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null)
    // No hay nada de la sesión en localStorage (el JWT vive en una cookie httpOnly,
    // ni el JS lo puede leer), así que al recargar la página no sabemos si hay
    // alguien logueado hasta preguntarle al backend. isRehydrating existe para que
    // ProtectedRoute no mande a nadie al login de una vez mientras se resuelve esto
    const [isRehydrating, setIsRehydrating] = useState(true)
    useEffect(() => {
        AuthService.me()
            .then(({ role, user }) => setAuth({ role, user }))
            .catch(() => setAuth(null))
            .finally(() => setIsRehydrating(false))
    }, [])
    const login = ({ role, user }) => setAuth({ role, user })
    const logout = () => setAuth(null)
    return (
        <AuthContext.Provider value={{
            user: auth?.user ?? null,
            role: auth?.role ?? null,
            isAuthenticated: !!auth,
            isRehydrating,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    )
}
export default AuthProvider