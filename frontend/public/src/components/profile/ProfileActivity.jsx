import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CalendarDays, Clock, MapPin, Star, Eye,
    HelpCircle, MoreVertical, ExternalLink, RotateCcw, X,
} from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import useFavorites from '@/hooks/useFavorites'
import toast from '@/lib/toast'

const ProfileActivity = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { favorites } = useFavorites()

    const [appointments, setAppointments] = useState({ upcoming: [], past: [] })

    useEffect(() => {
        // TODO: fetchAppointmentsByClient(user.id) → setAppointments(...)
    }, [user?.id])

    const cancelAppointment = (id) => {
        setAppointments(prev => ({
            ...prev,
            upcoming: prev.upcoming.filter(a => a.id !== id),
        }))
        toast.success('Cita cancelada correctamente.')
    }

    return (
        <div className='flex flex-col gap-8'>

            {/* Citas próximas + pasadas */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <AppointmentColumn
                    title='Citas próximas'
                    items={appointments.upcoming}
                    emptyText='No tiene citas programadas próximamente'
                    onBook={() => navigate('/buy')}
                    type='upcoming'
                    onCancel={cancelAppointment}
                />
                <AppointmentColumn
                    title='Citas pasadas'
                    items={appointments.past}
                    emptyText='No tiene citas anteriores registradas'
                    type='past'
                    onCancel={() => {}}
                />
            </div>

            {/* Banner de ayuda */}
            <div className='flex items-center gap-4 bg-orve-teal/8 border border-orve-teal/15 rounded-2xl px-5 py-4'>
                <div className='w-9 h-9 rounded-full bg-orve-teal/15 flex items-center justify-center shrink-0'>
                    <HelpCircle className='w-4.5 h-4.5 text-orve-teal/70' />
                </div>
                <div>
                    <p className='text-sm font-semibold text-orve-darker-teal'>¿Necesita ayuda con una cita?</p>
                    <p className='text-xs text-gray-500 mt-0.5'>
                        Puede comunicarse con nuestros asesores y sugerirle los detalles de cada cita.
                    </p>
                </div>
            </div>

            {/* Actividad reciente */}
            <section>
                <div className='flex items-center justify-between mb-4'>
                    <div>
                        <h3 className='text-base font-bold text-orve-darker-teal flex items-center gap-2'>
                            <Clock className='w-4 h-4' />
                            Actividad reciente
                        </h3>
                        <p className='text-xs text-gray-400 mt-0.5'>Un registro de las acciones que ha realizado en su cuenta</p>
                    </div>
                    <button className='text-xs text-orve-teal hover:underline'>Ver toda mi actividad</button>
                </div>
                <div className='flex flex-col gap-2'>
                    <EmptyActivity />
                </div>
            </section>

            {/* Propiedades favoritas */}
            <section>
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-bold text-orve-darker-teal flex items-center gap-2'>
                        <Star className='w-4 h-4' />
                        Mis propiedades favoritas
                    </h3>
                    <button onClick={() => navigate('/buy')} className='text-xs text-orve-teal hover:underline'>
                        Ver todas
                    </button>
                </div>
                {favorites.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-10 gap-2 bg-orve-teal/5 rounded-2xl border border-orve-teal/10'>
                        <Star className='w-8 h-8 text-orve-teal/25' />
                        <p className='text-sm text-orve-teal/50 font-medium'>Sin favoritos aún</p>
                        <p className='text-xs text-gray-400'>Las propiedades que marque con estrella aparecerán aquí.</p>
                        <button onClick={() => navigate('/buy')} className='mt-2 text-xs text-orve-teal underline hover:text-orve-darker-teal'>
                            Explorar propiedades
                        </button>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                        {favorites.map((p) => (
                            <FavoriteCard key={p._id} property={p} onClick={() => navigate(`/property/${p.public_id}`)} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

/* ─── AppointmentColumn ────────────────────────────────────────────── */

const AppointmentColumn = ({ title, items, emptyText, onBook, type, onCancel }) => {
    const navigate = useNavigate()
    return (
        <div>
            <div className='flex items-center justify-between mb-3'>
                <h3 className='text-sm font-bold text-orve-darker-teal flex items-center gap-2'>
                    <CalendarDays className='w-4 h-4' />
                    {title}
                </h3>
                {items.length > 0 && (
                    <button className='text-xs text-orve-teal hover:underline'>Ver todas</button>
                )}
            </div>
            {items.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 gap-2 bg-orve-teal/5 rounded-2xl border border-orve-teal/10 text-center px-4'>
                    <CalendarDays className='w-7 h-7 text-orve-teal/25' />
                    <p className='text-xs text-gray-400'>{emptyText}</p>
                    {onBook && (
                        <button onClick={onBook} className='mt-1 text-xs text-orve-teal underline hover:text-orve-darker-teal'>
                            Explorar propiedades
                        </button>
                    )}
                </div>
            ) : (
                <div className='flex flex-col gap-2'>
                    {items.map((apt) => (
                        <AppointmentCard
                            key={apt.id}
                            appointment={apt}
                            type={type}
                            onReschedule={() => navigate(`/property/${apt.public_id}/schedule`)}
                            onCancel={() => onCancel(apt.id)}
                            onView={() => navigate(`/property/${apt.public_id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

/* ─── AppointmentCard ──────────────────────────────────────────────── */

const AppointmentCard = ({ appointment, type, onReschedule, onCancel, onView }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        if (!menuOpen) return
        const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [menuOpen])

    return (
        <div className='flex gap-3 bg-white/60 border border-orve-teal/10 rounded-2xl p-3'>
            <div className='w-16 h-16 rounded-xl overflow-hidden bg-orve-teal/10 shrink-0'>
                {appointment.image && (
                    <img src={appointment.image} alt='' className='w-full h-full object-cover' />
                )}
            </div>
            <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-1'>
                    <p className='text-xs font-semibold text-orve-darker-teal leading-snug line-clamp-1'>
                        {appointment.property}
                    </p>
                    {/* Tres puntitos */}
                    <div ref={menuRef} className='relative shrink-0'>
                        <button
                            onClick={() => setMenuOpen(v => !v)}
                            className='text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors'
                        >
                            <MoreVertical className='w-3.5 h-3.5' />
                        </button>
                        {menuOpen && (
                            <div className='absolute right-0 top-5 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20'>
                                <button
                                    onClick={() => { onView(); setMenuOpen(false) }}
                                    className='w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors'
                                >
                                    <ExternalLink className='w-3.5 h-3.5 text-orve-teal/60' />
                                    Ver propiedad
                                </button>
                                {type === 'upcoming' && (
                                    <>
                                        <button
                                            onClick={() => { onReschedule(); setMenuOpen(false) }}
                                            className='w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors'
                                        >
                                            <RotateCcw className='w-3.5 h-3.5 text-orve-teal/60' />
                                            Reagendar
                                        </button>
                                        <div className='h-px bg-gray-100 mx-2 my-0.5' />
                                        <button
                                            onClick={() => { onCancel(); setMenuOpen(false) }}
                                            className='w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors'
                                        >
                                            <X className='w-3.5 h-3.5' />
                                            Cancelar cita
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <p className='text-[10px] text-gray-400 flex items-center gap-1 mt-0.5'>
                    <MapPin className='w-3 h-3' /> {appointment.address}
                </p>
                <div className='flex items-center gap-3 mt-1.5'>
                    <span className='text-[10px] text-gray-500 flex items-center gap-1'>
                        <CalendarDays className='w-3 h-3' /> {appointment.date}
                    </span>
                    <span className='text-[10px] text-gray-500 flex items-center gap-1'>
                        <Clock className='w-3 h-3' /> {appointment.time}
                    </span>
                </div>

                {type === 'upcoming' && (
                    <div className='flex gap-2 mt-2'>
                        <button
                            onClick={onReschedule}
                            className='text-[10px] font-semibold text-white bg-orve-darker-teal hover:bg-orve-teal px-2.5 py-1 rounded-lg transition-colors'
                        >
                            Reagendar
                        </button>
                        <button
                            onClick={onCancel}
                            className='text-[10px] font-semibold text-red-500 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors'
                        >
                            Cancelar cita
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─── Otros sub-componentes ────────────────────────────────────────── */

const EmptyActivity = () => (
    <div className='flex flex-col items-center justify-center py-8 gap-2 bg-orve-teal/5 rounded-2xl border border-orve-teal/10 text-center'>
        <Eye className='w-7 h-7 text-orve-teal/25' />
        <p className='text-xs text-gray-400'>No hay actividad reciente registrada</p>
    </div>
)

const FavoriteCard = ({ property, onClick }) => (
    <button onClick={onClick} className='relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer'>
        <img
            src={property.image ?? property.pictures?.[0]?.picture}
            alt={property.title}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
        <span className='absolute bottom-2 left-2 text-xs font-bold text-white'>
            ${property.price?.toLocaleString()}
        </span>
        <div className='absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center'>
            <Star className='w-3 h-3 text-white fill-white' />
        </div>
    </button>
)

export default ProfileActivity
