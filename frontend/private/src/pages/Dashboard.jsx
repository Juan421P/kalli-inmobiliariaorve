import { Home, Calendar, Briefcase, Users } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MetricCard from '@/components/dashboard/MetricCard'
import RecentAppointmentsTable from '@/components/dashboard/RecentAppointmentsTable'
import RecentOffersTable from '@/components/dashboard/RecentOffersTable'
import horseImg from '@/assets/horse.jpg'
import useAuth from '@/hooks/use-auth'
// ok mmmm esto debería de hacer una llamada a la api a lo mejor y se puede hacer un endpoint que solo retorne los primeros 10 (los 10 más recientes pues)
const SAMPLE_APPOINTMENTS = [
    { id: 1, client: 'Carlos Sánchez', property: 'Casa en Colonia Costa Rica', requestedDate: '12 de mayo de 2026; 10:00 AM', status: 'Confirmada', assignedCollaborator: 'Óscar Abel Velásquez Joyar' },
    { id: 2, client: 'Julio Pérez', property: 'Casa en Urbanización Madre Selva', requestedDate: '23 de mayo de 2026; 05:30 PM', status: 'Pendiente', assignedCollaborator: null },
    { id: 3, client: 'Diego Gómez', property: 'Casa en Colonia San Antonio 4', requestedDate: '10 de mayo de 2026; 02:00 PM', status: 'Pendiente', assignedCollaborator: null },
    { id: 4, client: 'Benjamín Alvarenga', property: 'Casa en Colonia Miralvalle', requestedDate: '12 de mayo de 2026; 11:00 AM', status: 'Confirmada', assignedCollaborator: 'Christopher Alexander Morales Quijano' },
    { id: 5, client: 'Ivanya Nolazco', property: 'Casa en Urbanización Metrópolis', requestedDate: '25 de mayo de 2026; 10:00 AM', status: 'Confirmada', assignedCollaborator: 'Mario Iván Vásquez Cruz' },
]
// igual aquí :VVvvVVVVvvVVvvV
const SAMPLE_OFFERS = [
    { id: 1, client: 'Carlos Sánchez', property: 'Casa en Colonia Costa Rica', monetaryOffer: 245000, status: 'Confirmada', offerDate: '18 de mayo de 2026' },
    { id: 2, client: 'Julio Pérez', property: 'Casa en Urbanización Madre Selva', monetaryOffer: 175000, status: 'Pendiente', offerDate: '18 de mayo de 2026' },
    { id: 3, client: 'Diego Gómez', property: 'Casa en Colonia San Antonio 4', monetaryOffer: 310000, status: 'Pendiente', offerDate: '19 de mayo de 2026' },
    { id: 4, client: 'Benjamín Alvarenga', property: 'Casa en Colonia Miralvalle', monetaryOffer: 120000, status: 'Confirmada', offerDate: '19 de mayo de 2026' },
    { id: 5, client: 'Ivanya Nolazco', property: 'Casa en Urbanización Metrópolis', monetaryOffer: 160000, status: 'Confirmada', offerDate: '20 de mayo de 2026' },
]
const Dashboard = () => {
    const { user } = useAuth()
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
                    <MetricCard icon={Calendar} title='Citas pendientes' value='12' trend='+ 3' trendUp={true} to='/appointments' />
                    <MetricCard icon={Briefcase} title='Ofertas pendientes' value='3' trend='- 1' trendUp={false} to='/offers' />
                    <MetricCard icon={Home} title='Propiedades activas' value='167' to='/properties' />
                    <MetricCard icon={Users} title='Clientes registrados' value='267' trend='+ 6' trendUp={true} to='/clients' />
                </div>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
                    <div className='lg:col-span-2 flex flex-col gap-5'>
                        <RecentAppointmentsTable appointments={SAMPLE_APPOINTMENTS} to='/appointments' />
                        <RecentOffersTable offers={SAMPLE_OFFERS} to='/offers' />
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