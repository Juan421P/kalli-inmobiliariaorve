import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/hooks/use-auth'
const ProtectedRoute = ({ requiredRole } = {}) => {
    const { isAuthenticated, isRehydrating, role } = useAuth()
    if (isRehydrating) return null
    if (!isAuthenticated) return <Navigate to='/' replace />
    if (requiredRole && role !== requiredRole) return <Navigate to='/dashboard' replace />
    return <Outlet />
}
export default ProtectedRoute