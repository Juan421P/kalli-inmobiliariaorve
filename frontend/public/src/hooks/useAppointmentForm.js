import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { appointmentService, scheduleAvailabilityService } from '@/services/Appointment'
import clientService from '@/services/Client'
import toast from '@/lib/toast'

// Mapea el indice de dia que devuelve Date.getDay() (0 = domingo) al nombre
// de dia que usa el backend en scheduleAvailability.
const DAY_MAP = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
    4: 'thursday', 5: 'friday', 6: 'saturday',
}

// Tiene que calzar con longText() en el backend
// (backend/src/schemas/fields/primitives.js), que es lo que valida `notes`.
export const REASON_MAX = 1000
export const REASON_REGEX = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:!?()#'"¿¡%/-]+$/

/**
 * Maneja el formulario de "Agendar cita" con react-hook-form: fecha/hora de
 * visita (dependen de los horarios configurados por el negocio) y motivo de
 * la visita. El contacto ya no se elige -siempre es por WhatsApp, al numero
 * que el cliente registro, ver whatsappNumber-. Los datos de calificacion del
 * interesado (origen de fondos, ingreso, direccion) tampoco se piden en este
 * formulario -el staff los completa despues, desde el panel privado-, asi
 * que se mandan como opcionales al backend. Fecha/hora son botones tipo
 * "chip" o el calendario y se exponen via `control` para <Controller>; el
 * motivo es un input nativo registrado normal con `register`.
 *
 * @param {object} property - propiedad sobre la que se agenda (de useProperty)
 * @param {string} publicId - public_id de la propiedad, para navegar de vuelta
 * @param {string} userId - id del cliente logueado, para mostrar su numero de WhatsApp
 */
const useAppointmentForm = ({ property, publicId, userId }) => {
    const navigate = useNavigate()

    const [schedules,          setSchedules]          = useState([])
    const [isLoadingSchedules, setIsLoadingSchedules]  = useState(true)
    const [noSchedules,        setNoSchedules]         = useState(false)
    const [isSubmitting,       setIsSubmitting]        = useState(false)
    const [whatsappNumber,     setWhatsappNumber]      = useState(null)

    // El contacto ya no se elige: siempre es por WhatsApp, al numero que el
    // cliente registro. Se trae de su perfil (el AuthContext solo guarda los
    // campos del login, no el telefono).
    useEffect(() => {
        if (!userId) return
        clientService.get(userId)
            .then((res) => {
                const c = res.client ?? res
                if (c.phone) setWhatsappNumber(`${c.phone.country_code} ${c.phone.number}`)
            })
            .catch(() => setWhatsappNumber(null))
    }, [userId])

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
            reason: '',
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

    // Arma el payload que espera POST /appointment (ver backend/src/schemas/fields/appointment.js).
    const onSubmit = async (values) => {
        setIsSubmitting(true)
        try {
            await appointmentService.create({
                property:        property?._id,
                time: {
                    startTime: values.selectedSlot.start_time,
                    endTime:   values.selectedSlot.end_time,
                },
                proposed_dates:  [values.selectedDate.toISOString()],
                notes: values.reason.trim(),
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
        whatsappNumber,
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