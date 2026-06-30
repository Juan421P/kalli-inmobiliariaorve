import { useParams, Link } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { ArrowLeft, CalendarIcon, Clock } from 'lucide-react'
import { Icon } from '@iconify/react'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import { Skeleton } from '@/components/ui/skeleton'
import useProperty from '@/hooks/useProperty'
import useAppointmentForm from '@/hooks/useAppointmentForm'
import coolBg from '@/assets/cool-ass-design-for-the-background.png'

const CONTACT_OPTIONS = [
    { value: 'whatsapp', label: 'WhatsApp',          icon: 'logos:whatsapp-icon'  },
    { value: 'phone',    label: 'Telefono',           icon: 'solar:phone-bold'     },
    { value: 'email',    label: 'Correo electronico', icon: 'solar:letter-bold'    },
]

const FUNDS_SOURCE_OPTIONS = [
    { value: 'own',   label: 'Fondos propios'   },
    { value: 'loan',  label: 'Prestamo/credito' },
    { value: 'mixed', label: 'Mixto'            },
]

/**
 * Pagina "Agendar cita" para visitar una propiedad. Esta detras de
 * ProtectedRoute (ver App.jsx), asi que siempre hay un usuario logueado
 * cuando se renderiza. Toda la logica de horarios/validacion/submit vive
 * en useAppointmentForm; este componente solo arma la UI y conecta cada
 * campo con react-hook-form (inputs nativos via `register`, botones tipo
 * "chip" y el calendario via `Controller`).
 */
const ScheduleAppointment = () => {
    const { public_id } = useParams()
    const { property, isLoading: isLoadingProperty, notFound } = useProperty(public_id)

    const {
        isLoadingSchedules,
        noSchedules,
        isSubmitting,
        isValid,
        register,
        control,
        selectedDate,
        slotsForDate,
        disabledDays,
        handleDateChange,
        handleSubmit,
    } = useAppointmentForm({ property, publicId: public_id })

    const isLoading = isLoadingProperty || isLoadingSchedules

    const bgImage = property?.pictures?.[0]?.picture
        ? `url(${property.pictures[0].picture})`
        : `url(${coolBg})`

    return (
        <div className='min-h-screen relative'>
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
                ) : notFound ? (
                    <div className='flex flex-col items-center justify-center py-24 gap-3'>
                        <p className='text-orve-teal/50 text-lg'>Propiedad no encontrada.</p>
                        <Link to='/' className='text-sm text-orve-teal underline'>Volver al inicio</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
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
                                    <p className='text-xs text-orve-teal/40'>Por el momento no hay horarios configurados. Intenta mas tarde.</p>
                                </div>
                            ) : (
                                <>
                                    <div className='flex flex-col md:flex-row gap-6'>
                                        <div className='flex flex-col gap-2 shrink-0'>
                                            <p className='text-sm font-medium text-orve-teal'>Cuando desea visitar?</p>
                                            <Controller
                                                control={control}
                                                name='selectedDate'
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Calendar
                                                        mode='single'
                                                        selected={field.value}
                                                        onSelect={handleDateChange}
                                                        disabled={disabledDays}
                                                        className='rounded-xl border border-orve-teal/10 bg-white/80 p-3'
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className='flex flex-col gap-3 flex-1'>
                                            <p className='text-sm font-medium text-orve-teal'>Seleccione una hora</p>
                                            <Controller
                                                control={control}
                                                name='selectedSlot'
                                                rules={{ required: true }}
                                                render={({ field }) => !selectedDate ? (
                                                    <p className='text-xs text-orve-teal/40'>Selecciona una fecha primero.</p>
                                                ) : slotsForDate.length === 0 ? (
                                                    <p className='text-xs text-orve-teal/40'>No hay horarios disponibles para este dia.</p>
                                                ) : (
                                                    <>
                                                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                                                            {slotsForDate.map((slot) => (
                                                                <button
                                                                    type='button'
                                                                    key={slot._id}
                                                                    onClick={() => field.onChange(slot)}
                                                                    className={cn(
                                                                        'px-3 py-2 rounded-xl text-sm font-medium border transition-colors',
                                                                        field.value?._id === slot._id
                                                                            ? 'bg-orve-teal text-white border-orve-teal'
                                                                            : 'bg-white/70 text-orve-teal border-orve-teal/20 hover:border-orve-teal hover:bg-orve-teal/5'
                                                                    )}
                                                                >
                                                                    {slot.start_time}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {field.value && (
                                                            <div className='flex items-center gap-2.5 bg-orve-teal/8 border border-orve-teal/15 rounded-xl px-4 py-3 mt-1'>
                                                                <Clock className='w-4 h-4 text-orve-teal/60 shrink-0' strokeWidth={1.5} />
                                                                <div>
                                                                    <p className='text-xs font-medium text-orve-teal'>Duracion aproximada</p>
                                                                    <p className='text-xs text-orve-teal/60'>30 - 45 minutos</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className='h-px bg-orve-teal/10' />

                                    <div className='flex flex-col gap-3'>
                                        <p className='text-sm font-medium text-orve-teal'>Como desea que lo contactemos?</p>
                                        <Controller
                                            control={control}
                                            name='contactMethod'
                                            rules={{ required: 'Selecciona como te contactaremos' }}
                                            render={({ field }) => (
                                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                                                    {CONTACT_OPTIONS.map(({ value, label, icon }) => (
                                                        <button
                                                            type='button'
                                                            key={value}
                                                            onClick={() => field.onChange(value)}
                                                            className={cn(
                                                                'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                                                                field.value === value
                                                                    ? 'bg-orve-teal text-white border-orve-teal'
                                                                    : 'bg-white/70 text-orve-teal border-orve-teal/20 hover:border-orve-teal hover:bg-orve-teal/5'
                                                            )}
                                                        >
                                                            <Icon icon={icon} className='w-5 h-5 shrink-0' />
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className='h-px bg-orve-teal/10' />

                                    <div className='flex flex-col gap-3'>
                                        <p className='text-sm font-medium text-orve-teal'>Cual es el origen de los fondos?</p>
                                        <Controller
                                            control={control}
                                            name='fundsSource'
                                            rules={{ required: 'Selecciona el origen de los fondos' }}
                                            render={({ field }) => (
                                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                                                    {FUNDS_SOURCE_OPTIONS.map(({ value, label }) => (
                                                        <button
                                                            type='button'
                                                            key={value}
                                                            onClick={() => field.onChange(value)}
                                                            className={cn(
                                                                'px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                                                                field.value === value
                                                                    ? 'bg-orve-teal text-white border-orve-teal'
                                                                    : 'bg-white/70 text-orve-teal border-orve-teal/20 hover:border-orve-teal hover:bg-orve-teal/5'
                                                            )}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <div className='flex flex-col gap-1.5'>
                                            <label className='text-xs font-medium text-orve-teal/80 uppercase tracking-wide'>
                                                Ingreso mensual
                                            </label>
                                            <div className='flex items-center gap-2 bg-white/70 border border-orve-teal/20 rounded-xl px-4 py-2.5'>
                                                <span className='text-orve-teal/50 text-sm font-medium'>$</span>
                                                <input
                                                    type='number'
                                                    min='0'
                                                    placeholder='0'
                                                    {...register('monthlyIncome', { required: true, min: 0 })}
                                                    className='flex-1 bg-transparent text-orve-darker-teal text-sm font-medium outline-none placeholder:text-orve-teal/30'
                                                />
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-1.5'>
                                            <label className='text-xs font-medium text-orve-teal/80 uppercase tracking-wide'>
                                                Direccion actual
                                            </label>
                                            <input
                                                type='text'
                                                placeholder='Ej. Colonia Escalon, calle La Reforma #123'
                                                {...register('addressReference', { required: true })}
                                                className='bg-white/70 border border-orve-teal/20 rounded-xl px-4 py-2.5 text-sm text-orve-darker-teal outline-none placeholder:text-orve-teal/30'
                                            />
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-1.5'>
                                        <label className='text-xs font-medium text-orve-teal/80 uppercase tracking-wide'>
                                            Motivo de la visita
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder='Contanos por que te interesa esta propiedad'
                                            {...register('reason', { required: true })}
                                            className='bg-white/70 border border-orve-teal/20 rounded-xl px-4 py-2.5 text-sm text-orve-darker-teal outline-none placeholder:text-orve-teal/30 resize-none'
                                        />
                                    </div>

                                    <div className='h-px bg-orve-teal/10' />

                                    <button
                                        type='submit'
                                        disabled={isSubmitting || !isValid}
                                        className='w-full flex items-center justify-center gap-2.5 bg-orve-teal hover:bg-orve-darker-teal disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors'
                                    >
                                        <CalendarIcon className='w-4 h-4 shrink-0' strokeWidth={1.5} />
                                        {isSubmitting ? 'Solicitando...' : 'Solicitar cita'}
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default ScheduleAppointment
