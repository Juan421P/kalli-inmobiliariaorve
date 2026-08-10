import { useEffect, useState } from 'react'
import { Home, Calendar, Briefcase, Users } from 'lucide-react'
import Sidebar from '@/components/sidebar'
import MetricCard from '@/components/dashboard/metricCard'
import RecentAppointmentsTable from '@/components/dashboard/recentAppointmentsTable'
import RecentOffersTable from '@/components/dashboard/recentOffersTable'
import horseImg from '@/assets/horse.jpg'
import useAuth from '@/hooks/useAuth'
import { appointmentsService } from '@/services/AppointmentsService'
import { offersService } from '@/services/OffersService'
import { propertyService } from '@/services/PropertyService'
import { clientsService } from '@/services/ClientsService'
import { getStatus, formatDate } from '@/components/appointments/constants'

// Mismos labels de estado que usa OffersTable, para consistencia visual
const OFFER_STATUS_LABELS = {
    pending:   'Pendiente',
    accepted:  'Confirmada',
    rejected:  'Rechazada',
    countered: 'Contrapropuesta',
    withdrawn: 'Retirada',
}

const Dashboard = () => {
    const { user, role } = useAuth()
    const isAdmin = role === 'admin'

    const [metrics, setMetrics] = useState({
        pendingAppointments: 0,
        pendingOffers:       0,
        activeProperties:    0,
        totalClients:        0,
    })
    const [recentAppointments, setRecentAppointments] = useState([])
    const [recentOffers,       setRecentOffers]       = useState([])

    useEffect(() => {
        const load = async () => {
            // Promise.allSettled: /client es solo para admins, así que un colaborador
            // no debe hacer que fallen las demás tarjetas por un 403 en esa llamada
            const [appointmentsResult, offersResult, propertiesResult, clientsResult] = await Promise.allSettled([
                appointmentsService.getAll(),
                offersService.getAll({ page: 1, limit: 5 }),
                propertyService.getAll(),
                isAdmin ? clientsService.getAll() : Promise.resolve(null),
            ])

            const appointmentsData = appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : null
            const offersData       = offersResult.status === 'fulfilled' ? offersResult.value : null
            const propertiesData   = propertiesResult.status === 'fulfilled' ? propertiesResult.value : null
            const clientsData      = clientsResult.status === 'fulfilled' ? clientsResult.value : null

            // Ambos endpoints ya devuelven los resultados ordenados por fecha de creación descendente
            const appointments = (appointmentsData?.appointments ?? []).slice(0, 5)

            setMetrics({
                pendingAppointments: (appointmentsData?.appointments ?? []).filter((a) => a.status === 'pending').length,
                pendingOffers:       offersData?.metrics?.pending ?? 0,
                activeProperties:    propertiesData?.metrics?.available ?? 0,
                totalClients:        clientsData?.clients?.length ?? 0,
            })

            setRecentAppointments(appointments.map((apt) => ({
                id:                   apt._id,
                client:               apt.buyer ? `${apt.buyer.name} ${apt.buyer.lastname}` : '—',
                property:             apt.property?.title ?? '—',
                requestedDate:        formatDate(apt.scheduled_date ?? apt.proposed_dates?.[0]),
                status:               getStatus(apt.status).label,
                assignedCollaborator: apt.collaborator ? `${apt.collaborator.name} ${apt.collaborator.lastname}` : null,
            })))

            setRecentOffers((offersData?.offers ?? []).map((o) => ({
                id:            o._id,
                client:        o.buyer ? `${o.buyer.name} ${o.buyer.lastname}` : '—',
                property:      o.property?.title ?? '—',
                monetaryOffer: o.price,
                status:        OFFER_STATUS_LABELS[o.status] ?? o.status,
                offerDate:     formatDate(o.createdAt),
            })))
        }
        load()
    }, [isAdmin])

    return (
        <div className='flex h-screen overflow-hidden bg-white/50'>
            <Sidebar
                userName={user?.name}
                userRole={user?.role === 'admin' ? 'Administrador' : 'Colaborador'}
                userAvatar={user?.avatarUrl}
            />
            <main className='flex-1 overflow-y-auto p-8'>
                <header className='mb-7 select-none'>
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Inicio</h1>
                    <p className='text-sm text-orve-teal mt-0.5'>Resumen general de la actividad del sistema</p>
                </header>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                    <MetricCard icon={Calendar}  title='Citas pendientes'      value={metrics.pendingAppointments} to='/appointments' />
                    <MetricCard icon={Briefcase} title='Ofertas pendientes'    value={metrics.pendingOffers}       to='/offers' />
                    <MetricCard icon={Home}      title='Propiedades activas'  value={metrics.activeProperties}    to='/properties' />
                    {isAdmin && (
                        <MetricCard icon={Users} title='Clientes registrados' value={metrics.totalClients} to='/clients' />
                    )}
                </div>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
                    <div className='lg:col-span-2 flex flex-col gap-5'>
                        <RecentAppointmentsTable appointments={recentAppointments} to='/appointments' />
                        <RecentOffersTable offers={recentOffers} to='/offers' />
                    </div>
                    <div className='lg:col-span-1 rounded-2xl overflow-hidden shadow-md border border-white/80 min-h-64 lg:min-h-0'>
                        <img
                            src={horseImg}
                            alt='Featured visual'
                            className='w-full h-full object-cover'
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
export default Dashboard