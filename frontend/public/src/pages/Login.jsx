import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/components/auth/login/LoginForm'
import useAuth from '@/hooks/useAuth'

/**
 * Pagina de inicio de sesion en /login.
 * Delega el layout a AuthLayout (columna foto + columna tarjeta) y el
 * formulario a LoginForm (que internamente usa useLoginForm + react-hook-form).
 *
 * Redirige a "/" si ya hay sesion activa (ruta inversa protegida): espera a
 * que isRehydrating termine antes de decidir para evitar un redirect falso
 * mientras el GET /auth/me todavia esta en vuelo al cargar la app.
 */
const Login = () => {
    const { isAuthenticated, isRehydrating } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isRehydrating && isAuthenticated) navigate('/', { replace: true })
    }, [isAuthenticated, isRehydrating, navigate])

    if (isRehydrating) return null

    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    )
}

export default Login
