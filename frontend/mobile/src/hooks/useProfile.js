import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import clientService from '@/services/clientService';

// Tienen que calzar con user.name/user.lastname/user.phone en el backend
// (backend/src/schemas/fields/primitives.js) — PUT /client/:id valida esto
// mismo del lado del servidor. Igual que frontend/public/src/hooks/useProfile.js.
const SHORT_TEXT_MAX = 20;
const SHORT_TEXT_REGEX = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s'-]+$/;
const PHONE_REGEX = /^\d{4}-\d{4}$/;

const validatePersonal = (p) => {
    const errors = {};
    const name = p.name.trim();
    const lastname = p.lastname.trim();
    const phone = p.phone.trim();

    if (!name) errors.name = 'El nombre es requerido.';
    else if (name.length > SHORT_TEXT_MAX) errors.name = `No puede superar los ${SHORT_TEXT_MAX} caracteres.`;
    else if (!SHORT_TEXT_REGEX.test(name)) errors.name = 'Solo letras, números, espacios, guiones y apóstrofes.';

    if (!lastname) errors.lastname = 'El apellido es requerido.';
    else if (lastname.length > SHORT_TEXT_MAX) errors.lastname = `No puede superar los ${SHORT_TEXT_MAX} caracteres.`;
    else if (!SHORT_TEXT_REGEX.test(lastname)) errors.lastname = 'Solo letras, números, espacios, guiones y apóstrofes.';

    if (!phone) errors.phone = 'El teléfono es requerido.';
    else if (!PHONE_REGEX.test(phone)) errors.phone = 'Formato: 0000-0000';

    return errors;
};

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

    const personalErrors = useMemo(() => validatePersonal(personal), [personal]);
    const personalIsValid = Object.keys(personalErrors).length === 0;

    const savePersonal = useCallback(async () => {
        if (!personalIsValid) return;
        setSaving(true);
        try {
            await clientService.update(user.id, {
                name: personal.name.trim(),
                lastname: personal.lastname.trim(),
                phone: personal.phone.trim(),
            });
            updateUser({ name: personal.name.trim(), lastname: personal.lastname.trim() });
            setEditing(false);
            toast.success('Perfil actualizado');
        } catch (err) {
            toast.error('No se pudo actualizar el perfil', err.friendlyMessage);
        } finally {
            setSaving(false);
        }
    }, [personal, personalIsValid, user?.id]);

    return {
        user,
        isLoading,
        personal, setPersonal,
        personalErrors, personalIsValid,
        editing, setEditing,
        saving, savePersonal,
        logout,
    };
};

export default useProfile;
