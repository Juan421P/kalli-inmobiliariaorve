import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { appointmentService, scheduleAvailabilityService } from '@/services/appointment'
import toast from '@/lib/toast'

// Mapea el indice de dia que devuelve Date.getDay() (0 = domingo) al nombre
// de dia que usa el backend en scheduleAvailability.
const DAY_MAP = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
    4: 'thursday', 5: 'friday', 6: 'saturday',
}

/**
 * Maneja el formulario de "Agendar cita" con react-hook-form: fecha/hora de
 * visita (dependen de los horarios configurados por el negocio), datos de
 * calificacion del interesado (origen de fondos, ingreso, motivo, direccion)
 * y metodo de contacto preferido. Los campos que son botones tipo "chip" o
 * el calendario (fecha, hora, fondos, contacto) se exponen via `control`
 * para que la pagina los maneje con <Controller>; ingreso/motivo/direccion
 * son inputs nativos y se registran normal con `register`.
 *
 * @param {object} property - propiedad sobre la que se agenda (de useProperty)
 * @param {string} publicId - public_id de la propiedad, para navegar de vuelta
 */
const useAppointmentForm = ({ property, publicId }) => {
    const navigate = useNavigate()

    const [schedules,          setSchedules]          = useState([])
    const [isLoadingSchedules, setIsLoadingSchedules]  = useState(true)
    const [noSchedules,        setNoSchedules]         = useState(false)
    const [isSubmitting,       setIsSubmitting]        = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors, isValid },
    } = useForm({
        // 'onChange' para que el boton de submit se habilite apenas se
        // completan los campos, sin esperar a un intento de submit fallido.
        mode: 'onChange',
        defaultValues: {
            selectedDate: null,
            selectedSlot: null,
            contactMethod: null,
            fundsSource: null,
            monthlyIncome: '',
            reason: '',
            addressReference: '',
        },
    })

    const selectedDate = watch('selectedDate')

    // Disponibilidad de horarios: viene de un endpoint aparte (configurado
    // por el negocio), independiente de la propiedad puntual.
    useEffect(() => {
        scheduleAvailabilityService.get()
            .then((data) => {
                const list = data?.schedules ?? []
                if (list.length > 0) setSchedules(list)
                else setNoSchedules(true)
            })
            .catch(() => setNoSchedules(true))
            .finally(() => setIsLoadingSchedules(false))
    }, [])

    // Slots de hora disponibles para el dia seleccionado en el calendario.
    const slotsForDate = selectedDate
        ? (schedules.find((s) => s.day === DAY_MAP[selectedDate.getDay()])?.intervals ?? [])
        : []

    // Bloquea en el calendario: dias pasados, y dias sin horario configurado.
    const disabledDays = (date) => {
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true
        if (noSchedules) return true
        const schedule = schedules.find((s) => s.day === DAY_MAP[date.getDay()])
        return !schedule || schedule.intervals.length === 0
    }

    // Al cambiar de dia, la hora elegida previamente ya no es valida.
    const handleDateChange = (date) => {
        setValue('selectedDate', date, { shouldValidate: true })
        setValue('selectedSlot', null)
    }

    // Arma el payload que espera POST /appointment (ver backend/src/models/appointment.js).
    // current_address.district deberia ser el id de un distrito real, pero el backend
    // todavia no tiene esa coleccion/endpoint, asi que se manda un ObjectId placeholder
    // hasta que exista (ver nota en backend; el "reference" de texto si es real).
    const onSubmit = async (values) => {
        setIsSubmitting(true)
        try {
            await appointmentService.create({
                property:        property?._id,
                time:            values.selectedSlot._id,
                proposed_dates:  [values.selectedDate.toISOString()],
                qualification:   {
                    funds_source:   values.fundsSource,
                    monthly_income: Number(values.monthlyIncome),
                    reason:         values.reason.trim(),
                },
                current_address: {
                    district:  '000000000000000000000000',
                    reference: values.addressReference.trim(),
                },
            })
            toast.success('¡Cita solicitada correctamente!')
            navigate(`/property/${publicId}`)
        } catch {
            toast.error('No se pudo solicitar la cita. Intenta de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        isLoadingSchedules,
        noSchedules,
        isSubmitting,
        isValid,
        errors,
        register,
        control,
        selectedDate,
        slotsForDate,
        disabledDays,
        handleDateChange,
        handleSubmit: handleSubmit(onSubmit),
    }
}

export default useAppointmentForm
