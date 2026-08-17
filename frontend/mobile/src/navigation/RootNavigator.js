import useAuth from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import MainTabs from './MainTabs';

// Mientras AuthProvider consulta /auth/me para rehidratar la sesion (ver
// providers/AuthProvider.js), se muestra la pantalla de carga personalizada
// en vez del menu, para no parpadear entre "sin sesion" y "con sesion".
const RootNavigator = () => {
    const { isRehydrating } = useAuth();
    if (isRehydrating) return <LoadingScreen label='Preparando tu sesión...' />;
    return <MainTabs />;
};

export default RootNavigator;
