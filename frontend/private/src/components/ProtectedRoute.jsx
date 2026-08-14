import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
// requiredRole es opcional: sin él solo pide estar logueado (lo comparten admin
// y colaborador), con él además exige el rol exacto — así se protegen rutas como
// /clients o /admins, que un colaborador ni debería ver en el sidebar
const ProtectedRoute = ({ requiredRole } = {}) => {
    const { isAuthenticated, isRehydrating, role } = useAuth()
    if (isRehydrating) return null // evita un parpadeo al login mientras se resuelve la sesión
    if (!isAuthenticated) return <Navigate to='/' replace />
    if (requiredRole && role !== requiredRole) return <Navigate to='/dashboard' replace />
    return <Outlet />
}
export default ProtectedRoute