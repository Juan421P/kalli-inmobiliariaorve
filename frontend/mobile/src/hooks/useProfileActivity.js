import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import clientService from '@/services/clientService';
import { appointmentService } from '@/services/appointmentService';

const UPCOMING_STATUSES = ['pending', 'assigned', 'scheduled'];

const formatDate = (dateStr) => dateStr
    ? new Date(dateStr).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

// Igual que frontend/public/src/components/profile/ProfileActivity.jsx ->
// toCardShape: el backend devuelve el documento completo (buyer/property
// poblados), acá se aplana a lo que necesita la tarjeta de cita.
const toCardShape = (apt) => ({
    id: apt._id,
    status: apt.status,
    publicId: apt.property?.public_id,
    property: apt.property?.title ?? 'Propiedad',
    image: apt.property?.pictures?.[0]?.picture,
    address: apt.current_address?.reference ?? apt.current_address?.address ?? '—',
    date: formatDate(apt.scheduled_date ?? apt.proposed_dates?.[0]) ?? '—',
    time: apt.time?.start_time && apt.time?.end_time ? `${apt.time.start_time} - ${apt.time.end_time}` : '—',
});

// Mismo formato de tiempo relativo que frontend/public/src/components/profile/ProfileActivity.jsx.
export const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${Math.floor(hours / 24)}d`;
};

/**
 * Logica de la pestaña "Actividad" del perfil: citas (proximas/pasadas),
 * ofertas que requieren respuesta, y feed de actividad reciente. Misma
 * fuente de datos que frontend/public/src/components/profile/ProfileActivity.jsx
 * (GET /appointment y GET /client/:id/activity), adaptado a RN — usa
 * Alert.alert nativo para confirmar la cancelacion en vez de un dialogo web.
 */
const useProfileActivity = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
    const [activity, setActivity] = useState([]);
    const [needsResponse, setNeedsResponse] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAppointments = () => appointmentService.getAll()
        .then((data) => {
            const list = (data?.appointments ?? []).map(toCardShape);
            setAppointments({
                upcoming: list.filter((a) => UPCOMING_STATUSES.includes(a.status)),
                past: list.filter((a) => !UPCOMING_STATUSES.includes(a.status)),
            });
        })
        .catch(() => setAppointments({ upcoming: [], past: [] }));

    const fetchActivity = () => clientService.getActivity(user.id)
        .then((data) => {
            setActivity(data?.activity ?? []);
            setNeedsResponse(data?.needsResponse ?? []);
        })
        .catch(() => { setActivity([]); setNeedsResponse([]); });

    useEffect(() => {
        if (!user?.id) { setIsLoading(false); return; }
        setIsLoading(true);
        Promise.all([fetchAppointments(), fetchActivity()]).finally(() => setIsLoading(false));
    }, [user?.id]);

    const confirmCancelAppointment = (id) => {
        Alert.alert('Cancelar cita', '¿Seguro que querés cancelar esta cita?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Sí, cancelar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await appointmentService.cancel(id);
                        setAppointments((prev) => ({ ...prev, upcoming: prev.upcoming.filter((a) => a.id !== id) }));
                        toast.success('Cita cancelada correctamente.');
                    } catch (err) {
                        toast.error('No se pudo cancelar la cita', err.friendlyMessage);
                    }
                },
            },
        ]);
    };

    return {
        appointments, activity, needsResponse, isLoading,
        confirmCancelAppointment,
        refetchActivity: fetchActivity,
    };
};

export default useProfileActivity;
