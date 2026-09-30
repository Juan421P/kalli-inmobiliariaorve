import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import useAuth from '@/hooks/useAuth';

/**
 * Centraliza el "necesitás iniciar sesión para..." que ahora aplica a
 * favoritos, ofertas y citas: si ya hay sesión ejecuta la acción de una vez;
 * si no, muestra un mensaje explicando por qué antes de mandar a Login (con
 * redirectTo/redirectParams cuando hay una pantalla que retomar después de
 * loguearse, ej. Agendar cita — ver PropertyDetailScreen).
 */
const useAuthGate = () => {
    const { isAuthenticated } = useAuth();
    const navigation = useNavigation();
    const [pending, setPending] = useState(null);

    const requireAuth = ({ message, onAuthenticated, redirectTo, redirectParams }) => {
        if (isAuthenticated) { onAuthenticated?.(); return; }
        setPending({ message, redirectTo, redirectParams });
    };

    const closeAuthModal = () => setPending(null);

    const confirmAuthLogin = () => {
        const { redirectTo, redirectParams } = pending ?? {};
        setPending(null);
        navigation.navigate('Login', redirectTo ? { redirectTo, redirectParams } : undefined);
    };

    return {
        requireAuth,
        authModalVisible: !!pending,
        authModalMessage: pending?.message,
        closeAuthModal,
        confirmAuthLogin,
    };
};

export default useAuthGate;
