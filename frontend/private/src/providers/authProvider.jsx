import { useEffect, useState } from 'react'
import AuthContext from '@/contexts/authContext'
import AuthService from '@/services/AuthService'
const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null)
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