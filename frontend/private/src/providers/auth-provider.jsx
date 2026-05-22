import { useEffect, useState } from 'react'
import AuthContext from '@/contexts/auth-context'
const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null)
    useEffect(() => {
        const stored = localStorage.getItem('auth') || sessionStorage.getItem('auth')
        if (stored) setAuth(JSON.parse(stored))
    }, [])
    const login = (data, rememberMe = false) => {
        const storage = rememberMe ? localStorage : sessionStorage
        setAuth(data)
    }
    const logout = () => {
        localStorage.removeItem('auth')
        sessionStorage.removeItem('auth')
        setAuth(null)
    }
    return (
        <AuthContext.Provider
            value={{
                ...auth,
                user: auth?.user,
                token: auth?.token,
                role: auth?.role,
                isAuthenticated: !!auth,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
export default AuthProvider