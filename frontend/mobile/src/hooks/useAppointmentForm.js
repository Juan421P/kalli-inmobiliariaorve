import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { appointmentService, scheduleAvailabilityService } from '@/services/appointmentService';
import useToast from '@/hooks/useToast';

// Mapea el indice de dia que devuelve Date.getDay() (0 = domingo) al nombre
// de dia que usa el backend en scheduleAvailability.
const DAY_MAP = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
    4: 'thursday', 5: 'friday', 6: 'saturday',
};

/**
 * Maneja el formulario de "Agendar cita": fecha/hora de visita (dependen de
 * los horarios configurados por el negocio), datos de calificacion del
 * interesado (origen de fondos, ingreso, motivo, direccion) y metodo de
 * contacto preferido.
 */
const useAppointmentForm = ({ property, publicId }) => {
    const navigation = useNavigation();
    const toast = useToast();

    const [schedules, setSchedules] = useState([]);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
    const [noSchedules, setNoSchedules] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        handleSubmit, watch, setValue, control,
        formState: { errors, isValid },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            selectedDate: null, selectedSlot: null, contactMethod: null,
            fundsSource: null, monthlyIncome: '', reason: '', addressReference: '',
        },
    });

    const selectedDate = watch('selectedDate');

    useEffect(() => {
        scheduleAvailabilityService.get()
            .then((data) => {
                const list = data?.schedules ?? [];
                if (list.length > 0) setSchedules(list);
                else setNoSchedules(true);
            })
            .catch(() => setNoSchedules(true))
            .finally(() => setIsLoadingSchedules(false));
    }, []);

    const slotsForDate = selectedDate
        ? (schedules.find((s) => s.day === DAY_MAP[selectedDate.getDay()])?.intervals ?? [])
        : [];

    const isDayDisabled = (date) => {
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
        if (noSchedules) return true;
        const schedule = schedules.find((s) => s.day === DAY_MAP[date.getDay()]);
        return !schedule || schedule.intervals.length === 0;
    };

    const handleDateChange = (date) => {
        setValue('selectedDate', date, { shouldValidate: true });
        setValue('selectedSlot', null);
    };

    // Arma el payload que espera POST /appointment. current_address.district
    // deberia ser el id de un distrito real, pero el backend todavia no tiene
    // esa coleccion/endpoint, asi que se manda un ObjectId placeholder (igual
    // que en la web) hasta que exista.
    const onSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            await appointmentService.create({
                property: property?._id,
                time: values.selectedSlot._id,
                proposed_dates: [values.selectedDate.toISOString()],
                qualification: {
                    funds_source: values.fundsSource,
                    monthly_income: Number(values.monthlyIncome),
                    reason: values.reason.trim(),
                },
                current_address: {
                    district: '000000000000000000000000',
                    reference: values.addressReference.trim(),
                },
            });
            toast.success('¡Cita solicitada correctamente!');
            navigation.navigate('PropertyDetail', { publicId });
        } catch {
            toast.error('No se pudo solicitar la cita. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isLoadingSchedules, noSchedules, isSubmitting, isValid, errors,
        control, watch, setValue,
        selectedDate, slotsForDate, isDayDisabled, handleDateChange,
        onSubmit: handleSubmit(onSubmit),
    };
};

export default useAppointmentForm;
