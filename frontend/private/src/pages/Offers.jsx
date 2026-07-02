import { Search, Briefcase, Clock, CheckCircle, CheckCheck } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { Input } from '@/components/ui/input'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { panel } from '@/lib/styles'
import useAuth from '@/hooks/use-auth'
import useOffers from '@/hooks/use-offers'
import OffersTable from '@/components/offers/OffersTable'
import UsersPagination from '@/components/users/UsersPagination'

// tarjeta pequeña que muestra un número resumido (total, pendientes, etc.)
const MetricCard = ({ icon: Icon, label, value, sub, highlight = false }) => (
    <div className={`${panel} flex items-center gap-4`}>
        <div className='w-10 h-10 rounded-xl bg-orve-teal/10 flex items-center justify-center shrink-0'>
            <Icon className='w-5 h-5 text-orve-teal' />
        </div>
        <div>
            <p className={`text-2xl font-bold leading-tight ${highlight ? 'text-red-500' : 'text-orve-teal'}`}>
                {value}
            </p>
            <p className='text-xs text-orve-teal/60 leading-tight'>{label}</p>
            {sub && <p className='text-xs text-orve-teal/40'>{sub}</p>}
        </div>
    </div>
)

// página principal de ofertas
const Offers = () => {
    const { user } = useAuth()

    const {
        offers, metrics, total, totalPages, currentPage,
        search, typeFilter, isLoading, LIMIT,
        setSearch, setTypeFilter,
        fetchOffers, updateStatus, deleteOffer,
    } = useOffers()

    return (
        <div className='flex h-screen overflow-hidden bg-white/50'>
            <Sidebar
                userName={user?.name}
                userRole={user?.role === 'admin' ? 'Administrador' : 'Colaborador'}
                userAvatar={user?.avatarUrl}
            />

            <main className='flex-1 overflow-y-auto p-8'>
                <header className='mb-7 select-none'>
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Ofertas</h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>Revisa, confirma y regestiona las ofertas</p>
                </header>

                <div className='flex flex-col gap-5'>
                    {/* Métricas */}
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                        <MetricCard icon={Briefcase}   label='Total'       value={metrics.total}     sub='ofertas'       />
                        <MetricCard icon={Clock}       label='Pendientes'  value={metrics.pending}   sub='por confirmar' highlight={metrics.pending > 0} />
                        <MetricCard icon={CheckCircle} label='Confirmadas' value={metrics.confirmed} sub='próximas'      />
                        <MetricCard icon={CheckCheck}  label='Completadas' value={metrics.completed} sub='este mes'      />
                    </div>

                    {/* Tabla */}
                    <div className={panel}>
                        {/* Buscador + filtro */}
                        <div className='flex items-center gap-3 mb-5'>
                            <div className='relative flex-1 max-w-lg'>
                                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orve-teal/40' />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder='Buscar por cliente o propiedad'
                                    className='pl-9 bg-white/70'
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className='w-36 bg-white/70 border-orve-teal/20 text-orve-teal focus-visible:ring-orve-teal/30'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position='popper' className='border-orve-teal/20'>
                                    <SelectItem value='all'  className='text-orve-teal focus:bg-orve-teal/10 focus:text-orve-teal'>Todos</SelectItem>
                                    <SelectItem value='rent' className='text-orve-teal focus:bg-orve-teal/10 focus:text-orve-teal'>Alquiler</SelectItem>
                                    <SelectItem value='sale' className='text-orve-teal focus:bg-orve-teal/10 focus:text-orve-teal'>Venta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <OffersTable
                            offers={offers}
                            isLoading={isLoading}
                            onStatusChange={updateStatus}
                            onDelete={deleteOffer}
                        />

                        {!isLoading && (
                            <UsersPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                total={total}
                                limit={LIMIT}
                                entityLabel='propiedades'
                                onPageChange={(page) => fetchOffers(page, search, typeFilter)}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Offers
