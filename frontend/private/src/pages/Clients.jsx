import { Search, Users, UserCheck, UserX } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { Input } from '@/components/ui/input'
import { panel } from '@/lib/styles'
import useClients from '@/hooks/useClients'
import ClientsTable from '@/components/users/ClientsTable'
import UsersPagination from '@/components/users/UsersPagination'

// ─── Tarjeta de métrica ───────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, highlight = false }) => (
    <div className={`${panel} flex items-center gap-4`}>
        <div className='w-10 h-10 rounded-xl bg-orve-teal/10 flex items-center justify-center shrink-0'>
            <Icon className='w-5 h-5 text-orve-teal' />
        </div>
        <div>
            <p className='text-xs text-orve-teal/60 leading-tight'>{label}</p>
            <p className={`text-2xl font-bold leading-tight ${highlight ? 'text-red-500' : 'text-orve-teal'}`}>
                {value}
            </p>
        </div>
    </div>
)

// ─── Página ───────────────────────────────────────────────────────────────────
const Clients = () => {
    const {
        clients, metrics, total, totalPages, currentPage,
        search, isLoading, LIMIT,
        setSearch, setCurrentPage,
        setActive,
    } = useClients()

    const handleToggleActive = (client, active) => setActive(client._id, active)

    return (
        <div className='flex h-screen overflow-hidden bg-white/50'>
            <Sidebar />

            <main className='flex-1 overflow-y-auto p-8'>
                <header className='mb-7 select-none'>
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Clientes</h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>Administre todos los clientes registrados en el sistema</p>
                </header>

                <div className='flex flex-col gap-5'>
                    {/* Métricas */}
                    <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
                        <MetricCard icon={Users}     label='Total de clientes' value={metrics.total} />
                        <MetricCard icon={UserCheck} label='Activos'           value={metrics.active} />
                        <MetricCard icon={UserX}     label='Inactivos'        value={metrics.inactive} highlight={metrics.inactive > 0} />
                    </div>

                    {/* Tabla */}
                    <div className={panel}>
                        {/* Buscador */}
                        <div className='flex items-center gap-3 mb-5'>
                            <div className='relative flex-1 max-w-lg'>
                                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orve-teal/40' />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder='Buscar por nombre o correo'
                                    className='pl-9 bg-white/70'
                                />
                            </div>
                        </div>

                        <ClientsTable
                            clients={clients}
                            isLoading={isLoading}
                            onToggleActive={handleToggleActive}
                        />

                        {!isLoading && (
                            <UsersPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                total={total}
                                limit={LIMIT}
                                entityLabel='clientes'
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Clients
