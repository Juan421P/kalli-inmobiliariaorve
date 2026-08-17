import { useCallback, useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import clientService from '@/services/clientService';

/**
 * Logica del perfil del cliente. Carga los datos completos del usuario desde
 * el backend (phone, etc.) ya que el AuthContext solo guarda los campos del
 * login (name, lastname, email, picture).
 */
const useProfile = () => {
    const { user, logout, updateUser } = useAuth();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [personal, setPersonal] = useState({ name: '', lastname: '', email: '', phone: '' });

    useEffect(() => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        clientService.get(user.id)
            .then((res) => {
                const c = res?.client ?? res;
                setPersonal({
                    name: c.name ?? '',
                    lastname: c.lastname ?? '',
                    email: c.email ?? '',
                    phone: c.phone?.number ?? c.phone ?? '',
                });
            })
            .catch(() => {
                setPersonal({
                    name: user.name ?? '',
                    lastname: user.lastname ?? '',
                    email: user.email ?? '',
                    phone: '',
                });
            })
            .finally(() => setIsLoading(false));
    }, [user?.id]);

    const savePersonal = useCallback(async () => {
        setSaving(true);
        try {
            await clientService.update(user.id, personal);
            updateUser({ name: personal.name, lastname: personal.lastname });
            setEditing(false);
            toast.success('Perfil actualizado');
        } catch {
            toast.error('No se pudo actualizar el perfil', 'Intenta de nuevo mas tarde.');
        } finally {
            setSaving(false);
        }
    }, [personal, user?.id]);

    return {
        user,
        isLoading,
        personal, setPersonal,
        editing, setEditing,
        saving, savePersonal,
        logout,
    };
};

export default useProfile;
