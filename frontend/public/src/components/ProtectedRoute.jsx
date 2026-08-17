import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

/**
 * Guard de rutas privadas: se usa como elemento "padre" de un grupo de
 * rutas en el router (ver App.jsx), y solo renderiza el <Outlet/> (las
 * rutas hijas) si hay sesion activa. Si se le pasa `requiredRole`, ademas
 * exige que el rol del usuario logueado coincida (para paneles internos).
 *
 * @param {string} [requiredRole] - rol exigido para entrar (ej. 'admin'); si se omite, alcanza con estar logueado
 */
const ProtectedRoute = ({ requiredRole } = {}) => {
    const { isAuthenticated, isRehydrating, role } = useAuth()

    // Mientras se confirma la sesion contra el backend (ver AuthProvider),
    // no redirigimos todavia: si no esperamos esto, un refresh de pagina
    // patearia al usuario afuera por un instante aunque su sesion sea valida.
    if (isRehydrating) return null
    if (!isAuthenticated) return <Navigate to='/' replace />
    if (requiredRole && role !== requiredRole) return <Navigate to='/dashboard' replace />
    return <Outlet />
}
export default ProtectedRoute