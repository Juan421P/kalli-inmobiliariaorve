import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CalendarDays, Clock, MapPin, Heart, Eye, Tag,
    HelpCircle, MoreVertical, ExternalLink, RotateCcw, X,
} from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import useFavorites from '@/hooks/useFavorites'
import ClientService from '@/services/Client'
import { appointmentService } from '@/services/Appointment'
import OfferDetailSheet from '@/components/profile/OfferDetailSheet'
import toast from '@/lib/toast'

const UPCOMING_STATUSES = ['pending', 'assigned', 'scheduled']

const formatDate = (dateStr) => dateStr
    ? new Date(dateStr).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

// El backend devuelve el documento completo (buyer/property poblados,
// current_address, time.start_time/end_time...); acá se aplana a lo que
// espera AppointmentCard.
const toCardShape = (apt) => ({
    id: apt._id,
    status: apt.status,
    public_id: apt.property?.public_id,
    property: apt.property?.title ?? 'Propiedad',
    image: apt.property?.pictures?.[0]?.picture,
    address: apt.current_address?.reference ?? apt.current_address?.address ?? '—',
    date: formatDate(apt.scheduled_date ?? apt.proposed_dates?.[0]) ?? '—',
    time: apt.time?.start_time && apt.time?.end_time ? `${apt.time.start_time} - ${apt.time.end_time}` : '—',
})

// Formatea una fecha como tiempo relativo ("Hace 2h", "Hace 3d"), igual que
// ListingCard.jsx usa para "publicado hace...".
const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / 3_600_000)
    if (hours < 1)  return 'Hace menos de 1 hora'
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${Math.floor(hours / 24)}d`
}

const OFFER_STATUS_LABEL = {
    pending:   'Oferta pendiente',
    countered: 'Contraoferta recibida',
    accepted:  'Oferta aceptada',
    rejected:  'Oferta rechazada',
    withdrawn: 'Oferta retirada',
}

const ProfileActivity = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { favorites } = useFavorites()

    const [appointments, setAppointments] = useState({ upcoming: [], past: [] })
    const [activity, setActivity] = useState([])
    const [isLoadingActivity, setIsLoadingActivity] = useState(true)
    const [openOfferId, setOpenOfferId] = useState(null)

    const fetchActivity = () => {
        if (!user?.id) return
        ClientService.getActivity(user.id)
            .then((data) => setActivity(data.activity ?? []))
            .catch(() => setActivity([]))
            .finally(() => setIsLoadingActivity(false))
    }

    useEffect(() => {
        if (!user?.id) return
        appointmentService.getAll()
            .then((data) => {
                const list = (data?.appointments ?? []).map(toCardShape)
                setAppointments({
                    upcoming: list.filter((a) => UPCOMING_STATUSES.includes(a.status)),
                    past: list.filter((a) => !UPCOMING_STATUSES.includes(a.status)),
                })
            })
            .catch(() => setAppointments({ upcoming: [], past: [] }))
    }, [user?.id])

    useEffect(fetchActivity, [user?.id])

    const cancelAppointment = async (id) => {
        try {
            await appointmentService.cancel(id)
            setAppointments(prev => ({
                ...prev,
                upcoming: prev.upcoming.filter(a => a.id !== id),
            }))
            toast.success('Cita cancelada correctamente.')
        } catch (err) {
            toast.error(err.friendlyMessage)
        }
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
                    {isLoadingActivity ? (
                        <div className='flex flex-col gap-2'>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className='h-14 rounded-2xl bg-orve-teal/5 border border-orve-teal/10 animate-pulse' />
                            ))}
                        </div>
                    ) : activity.length === 0 ? (
                        <EmptyActivity />
                    ) : (
                        activity.map((item, i) => (
                            <ActivityItem
                                key={`${item.type}-${item.property._id}-${i}`}
                                item={item}
                                onOpenOffer={setOpenOfferId}
                            />
                        ))
                    )}
                </div>
            </section>

            {/* Propiedades favoritas */}
            <section>
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-bold text-orve-darker-teal flex items-center gap-2'>
                        <Heart className='w-4 h-4' />
                        Mis propiedades favoritas
                    </h3>
                    <button onClick={() => navigate('/buy')} className='text-xs text-orve-teal hover:underline'>
                        Ver todas
                    </button>
                </div>
                {favorites.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-10 gap-2 bg-orve-teal/5 rounded-2xl border border-orve-teal/10'>
                        <Heart className='w-8 h-8 text-orve-teal/25' />
                        <p className='text-sm text-orve-teal/50 font-medium'>Sin favoritos aún</p>
                        <p className='text-xs text-gray-400'>Las propiedades que marque como favoritas aparecerán aquí.</p>
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

            <OfferDetailSheet
                offerId={openOfferId}
                open={!!openOfferId}
                onOpenChange={(next) => !next && setOpenOfferId(null)}
                onChanged={fetchActivity}
            />
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

// Una fila del feed de "Actividad reciente": propiedades vistas u ofertas
// hechas, ordenadas por fecha (ver services/client.js -> getActivity).
const ActivityItem = ({ item, onOpenOffer }) => {
    const navigate = useNavigate()
    const { property } = item
    const isOffer = item.type === 'offer'
    const image = property.pictures?.[0]?.picture

    return (
        <button
            onClick={() => isOffer ? onOpenOffer(item.id) : navigate(`/property/${property.public_id}`)}
            className='flex items-center gap-3 bg-white/60 hover:bg-white/90 border border-orve-teal/10 rounded-2xl p-3 text-left transition-colors'
        >
            <div className='w-11 h-11 rounded-xl overflow-hidden bg-orve-teal/10 shrink-0'>
                {image && <img src={image} alt='' className='w-full h-full object-cover' />}
            </div>
            <div className='flex-1 min-w-0'>
                <p className='text-xs font-semibold text-orve-darker-teal truncate'>
                    {property.title}
                </p>
                <p className='text-[10px] text-gray-400 flex items-center gap-1 mt-0.5'>
                    {isOffer
                        ? <><Tag className='w-3 h-3 shrink-0' /> {OFFER_STATUS_LABEL[item.status] ?? 'Oferta enviada'}{item.price ? ` · $${item.price.toLocaleString()}` : ''}</>
                        : <><Eye className='w-3 h-3 shrink-0' /> Propiedad vista</>
                    }
                </p>
            </div>
            <span className='text-[10px] text-gray-400 shrink-0'>{timeAgo(item.at)}</span>
        </button>
    )
}

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
        <div className='absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center'>
            <Heart className='w-3 h-3 text-white fill-white' />
        </div>
    </button>
)

export default ProfileActivity
