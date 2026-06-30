import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CalendarIcon, Clock } from 'lucide-react'
import { Icon } from '@iconify/react'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { appointmentService, scheduleAvailabilityService } from '@/services/appointment'
import propertyService from '@/services/property'
import toast from '@/lib/toast'
import coolBg from '@/assets/cool-ass-design-for-the-background.png'

// ─── Días en inglés ───────────────────────────────────────────────────────────
const DAY_MAP = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
    4: 'thursday', 5: 'friday', 6: 'saturday',
}

const CONTACT_OPTIONS = [
    { value: 'whatsapp', label: 'WhatsApp',          icon: 'logos:whatsapp-icon'      },
    { value: 'phone',    label: 'Teléfono',           icon: 'solar:phone-bold'          },
    { value: 'email',    label: 'Correo electrónico', icon: 'solar:letter-bold'         },
]

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_PROPERTY = {
    _id: 'mock1',
    title: 'Apartamento en Colonia San Benito, San Salvador',
    pictures: [{ picture: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' }],
}

const MOCK_SCHEDULES = [
    { _id: 's1', day: 'monday',    intervals: [{ _id: 't1', start_time: '9:00 AM' }, { _id: 't2', start_time: '10:00 AM' }, { _id: 't3', start_time: '11:00 AM' }, { _id: 't4', start_time: '2:00 PM' }, { _id: 't5', start_time: '3:00 PM' }, { _id: 't6', start_time: '4:00 PM' }, { _id: 't7', start_time: '5:00 PM' }] },
    { _id: 's2', day: 'tuesday',   intervals: [{ _id: 't1', start_time: '9:00 AM' }, { _id: 't2', start_time: '10:00 AM' }, { _id: 't3', start_time: '2:00 PM' }] },
    { _id: 's3', day: 'wednesday', intervals: [{ _id: 't1', start_time: '9:00 AM' }, { _id: 't2', start_time: '3:00 PM' }] },
    { _id: 's4', day: 'thursday',  intervals: [{ _id: 't1', start_time: '10:00 AM' }, { _id: 't2', start_time: '4:00 PM' }] },
    { _id: 's5', day: 'friday',    intervals: [{ _id: 't1', start_time: '9:00 AM' }, { _id: 't2', start_time: '2:00 PM' }, { _id: 't3', start_time: '5:00 PM' }] },
    { _id: 's6', day: 'saturday',  intervals: [{ _id: 't1', start_time: '10:00 AM' }] },
]
const ScheduleAppointment = () => {
    const { public_id }  = useParams()
    const navigate       = useNavigate()

    const [property,     setProperty]     = useState(null)
    const [schedules,    setSchedules]    = useState([])
    const [isLoading,    setIsLoading]    = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [noSchedules,  setNoSchedules]  = useState(false)

    const [selectedDate,    setSelectedDate]    = useState(null)
    const [selectedSlot,    setSelectedSlot]    = useState(null)
    const [selectedContact, setSelectedContact] = useState(null)

    useEffect(() => {
        Promise.all([
            propertyService.getByPublicId(public_id).catch(() => null),
            scheduleAvailabilityService.get().catch(() => null),
        ]).then(([propData, schedData]) => {
            setProperty(propData?.property ?? propData ?? MOCK_PROPERTY)
            const list = schedData?.schedules ?? []
            setSchedules(list.length > 0 ? list : MOCK_SCHEDULES)
            setNoSchedules(false)
        }).finally(() => setIsLoading(false))
    }, [public_id])

    const slotsForDate = selectedDate
        ? (schedules.find((s) => s.day === DAY_MAP[selectedDate.getDay()])?.intervals ?? [])
        : []

    const disabledDays = (date) => {
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true
        if (noSchedules) return true
        const schedule = schedules.find((s) => s.day === DAY_MAP[date.getDay()])
        return !schedule || schedule.intervals.length === 0
    }

    const handleSubmit = async () => {
        if (!selectedDate || !selectedSlot || !selectedContact) {
            toast.error('Completá todos los campos antes de solicitar la cita.')
            return
        }
        setIsSubmitting(true)
        try {
            await appointmentService.create({
                property:        property?._id,
                time:            selectedSlot._id,
                proposed_dates:  [selectedDate.toISOString()],
                qualification:   { funds_source: 'own', monthly_income: 0, reason: 'Interesado en la propiedad' },
                current_address: { district: '000000000000000000000000', reference: 'Sin especificar' },
            })
            toast.success('¡Cita solicitada correctamente!')
            navigate(`/property/${public_id}`)
        } catch {
            toast.error('Error', 'No se pudo solicitar la cita. Intentá de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const bgImage = property?.pictures?.[0]?.picture
        ? `url(${property.pictures[0].picture})`
        : `url(${coolBg})`

    return (
        <div className='min-h-screen relative'>
            {/* Imagen de fondo de toda la página */}
            <div
                className='fixed inset-0 bg-cover bg-center opacity-30 z-0'
                style={{ backgroundImage: bgImage }}
            />
            <div className='fixed inset-0 z-0 bg-white/30' />

            <Navbar />
            <div className='relative z-10 pt-14 max-w-5xl mx-auto px-4 py-8'>
                {isLoading ? (
                    <div className='flex gap-8'>
                        <Skeleton className='w-64 h-96 rounded-2xl shrink-0' />
                        <Skeleton className='flex-1 h-96 rounded-2xl' />
                    </div>
                ) : (
                    <div className='flex flex-col gap-3'>
                        {/* Link volver + título */}
                        <Link
                            to={`/property/${public_id}`}
                            className='flex items-center gap-1.5 text-sm text-orve-teal/70 hover:text-orve-teal transition-colors'
                        >
                            <ArrowLeft className='w-4 h-4' />
                            Volver a la propiedad
                        </Link>

                        {property?.title && (
                            <h2 className='text-3xl font-bold text-orve-darker-teal leading-tight mb-2'>
                                {property.title}
                            </h2>
                        )}

                        {/* Formulario */}
                        <div className='bg-white/65 backdrop-blur-sm border border-white rounded-2xl shadow-sm p-6 flex flex-col gap-6'>

                            <div className='flex items-center gap-3'>
                                <div className='w-9 h-9 rounded-xl bg-orve-teal/10 flex items-center justify-center shrink-0'>
                                    <CalendarIcon className='w-5 h-5 text-orve-teal' strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h1 className='text-lg font-bold text-orve-darker-teal'>Agendar cita</h1>
                                    <p className='text-xs text-orve-teal/60'>Visite este inmueble en persona</p>
                                </div>
                            </div>

                            <div className='h-px bg-orve-teal/10' />

                            {noSchedules ? (
                                <div className='flex flex-col items-center justify-center py-10 gap-2 text-center'>
                                    <CalendarIcon className='w-8 h-8 text-orve-teal/20' strokeWidth={1} />
                                    <p className='text-sm font-medium text-orve-teal/60'>No hay horarios disponibles</p>
                                    <p className='text-xs text-orve-teal/40'>Por el momento no hay horarios configurados. Intentá más tarde.</p>
                                </div>
                            ) : (
                                <>
                                    <div className='flex flex-col md:flex-row gap-6'>
                                        <div className='flex flex-col gap-2 shrink-0'>
                                            <p className='text-sm font-medium text-orve-teal'>¿Cuándo desea visitar?</p>
                                            <Calendar
                                                mode='single'
                                                selected={selectedDate}
                                                onSelect={(date) => { setSelectedDate(date); setSelectedSlot(null) }}
                                                disabled={disabledDays}
                                                className='rounded-xl border border-orve-teal/10 bg-white/80 p-3'
                                            />
                                        </div>

                                        <div className='flex flex-col gap-3 flex-1'>
                                            <p className='text-sm font-medium text-orve-teal'>Seleccione una hora</p>
                                            {!selectedDate ? (
                                                <p className='text-xs text-orve-teal/40'>Seleccioná una fecha primero.</p>
                                            ) : slotsForDate.length === 0 ? (
                                                <p className='text-xs text-orve-teal/40'>No hay horarios disponibles para este día.</p>
                                            ) : (
                                                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                                                    {slotsForDate.map((slot) => (
                                                        <button
                                                            key={slot._id}
                                                            onClick={() => setSelectedSlot(slot)}
                                                            className={cn(
                                                                'px-3 py-2 rounded-xl text-sm font-medium border transition-colors',
                                                                selectedSlot?._id === slot._id
                                                                    ? 'bg-orve-teal text-white border-orve-teal'
                                                                    : 'bg-white/70 text-orve-teal border-orve-teal/20 hover:border-orve-teal hover:bg-orve-teal/5'
                                                            )}
                                                        >
                                                            {slot.start_time}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {selectedSlot && (
                                                <div className='flex items-center gap-2.5 bg-orve-teal/8 border border-orve-teal/15 rounded-xl px-4 py-3 mt-1'>
                                                    <Clock className='w-4 h-4 text-orve-teal/60 shrink-0' strokeWidth={1.5} />
                                                    <div>
                                                        <p className='text-xs font-medium text-orve-teal'>Duración aproximada</p>
                                                        <p className='text-xs text-orve-teal/60'>30 - 45 minutos</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className='h-px bg-orve-teal/10' />

                                    <div className='flex flex-col gap-3'>
                                        <p className='text-sm font-medium text-orve-teal'>¿Cómo desea que lo contactemos?</p>
                                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                                            {CONTACT_OPTIONS.map(({ value, label, icon }) => (
                                                <button
                                                    key={value}
                                                    onClick={() => setSelectedContact(value)}
                                                    className={cn(
                                                        'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                                                        selectedContact === value
                                                            ? 'bg-orve-teal text-white border-orve-teal'
                                                            : 'bg-white/70 text-orve-teal border-orve-teal/20 hover:border-orve-teal hover:bg-orve-teal/5'
                                                    )}
                                                >
                                                    <Icon icon={icon} className='w-5 h-5 shrink-0' />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !selectedDate || !selectedSlot || !selectedContact}
                                        className='w-full flex items-center justify-center gap-2.5 bg-orve-teal hover:bg-orve-darker-teal disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors'
                                    >
                                        <CalendarIcon className='w-4 h-4 shrink-0' strokeWidth={1.5} />
                                        {isSubmitting ? 'Solicitando...' : 'Solicitar cita'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ScheduleAppointment