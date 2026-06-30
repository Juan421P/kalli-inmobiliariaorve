import { useState, useCallback } from 'react';
import useAuth from '@/hooks/useAuth';
const tabs = [
    { key: 'profile', label: 'Perfil' },
    { key: 'activity', label: 'Actividad' },
    { key: 'security', label: 'Seguridad' },
];
const useProfile = () => {
    const { user, role } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [editingPersonal, setEditingPersonal] = useState(false);
    const [editingId, setEditingId] = useState(false);
    const [savingPersonal, setSavingPersonal] = useState(false);
    const [savingId, setSavingId] = useState(false);
    const [personal, setPersonal] = useState({
        name: user?.name ?? '',
        lastname: user?.lastname ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
    });
    const [identification, setIdentification] = useState({
        document_type: user?.document_type ?? 'Cédula de identidad (DUI)',
        document_number: user?.document_number ?? '',
    });
    const savePersonal = useCallback(async () => {
        setSavingPersonal(true)
        try {
            // await ClientService.put(user.id, { name: personal.name, ... })
            setEditingPersonal(false)
        } catch {
            // toast.error(...)
        } finally {
            setSavingPersonal(false)
        }
    }, [personal])
    const saveId = useCallback(async () => {
        setSavingId(true)
        try {
            // await ClientService.put(user.id, { ...identification })
            setEditingId(false)
        } catch {
            // toast.error(...)
        } finally {
            setSavingId(false)
        }
    }, [identification])
    return {
        user, role,
        tabs, activeTab, setActiveTab,
        personal, setPersonal,
        editingPersonal, setEditingPersonal,
        savingPersonal, savePersonal,
        identification, setIdentification,
        editingId, setEditingId,
        savingId, saveId,
    };
};
export default useProfile;