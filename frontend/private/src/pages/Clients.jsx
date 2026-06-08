import { useState, useEffect, useCallback } from 'react'
import { Search, UserPlus, Users, Home, PhoneCall, ShoppingBag } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { panel } from '@/lib/styles'
import toast from '@/lib/toast'
import useAuth from '@/hooks/use-auth'
import { clientsService } from '@/services/clients'
import ClientsTable from '@/components/users/ClientsTable'
import UserCreateForm from '@/components/users/UserCreateForm'
import UsersPagination from '@/components/users/UsersPagination'

const LIMIT = 5

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
    const { user } = useAuth()

    const [tab,          setTab]          = useState('list')
    const [clients,      setClients]      = useState([])
    const [metrics,      setMetrics]      = useState({ totalActive: 0, interestedBuy: 0, interestedRent: 0, pendingContact: 0 })
    const [total,        setTotal]        = useState(0)
    const [currentPage,  setCurrentPage]  = useState(1)
    const [search,       setSearch]       = useState('')
    const [isLoading,    setIsLoading]    = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchClients = useCallback(async (page = 1, q = search) => {
        setIsLoading(true)
        try {
            const data = await clientsService.getAll({ search: q, page, limit: LIMIT })
            setClients(data.clients)
            setTotal(data.total)
            setCurrentPage(page)
            if (data.metrics) setMetrics(data.metrics)
        } catch {
            toast.error('Error', 'No se pudieron cargar los clientes.')
        } finally {
            setIsLoading(false)
        }
    }, [search])

    useEffect(() => {
        fetchClients(1, '')
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => fetchClients(1, search), 400)
        return () => clearTimeout(timer)
    }, [search])

    // ── Crear ──────────────────────────────────────────────────────────────────
    const handleCreate = async (formData) => {
        setIsSubmitting(true)
        try {
            await clientsService.create(formData)
            toast.success('Cliente agregado correctamente.')
            setTab('list')
            fetchClients(1, '')
        } catch {
            toast.error('Error', 'No se pudo agregar el cliente.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // ── Editar ─────────────────────────────────────────────────────────────────
    const handleEdit = (client) => {
        toast('Próximamente', { description: `Editar a ${client.name} ${client.lastname}` })
    }

    // ── Eliminar ───────────────────────────────────────────────────────────────
    const handleDelete = async (client) => {
        try {
            await clientsService.remove(client._id)
            toast.success(`${client.name} ${client.lastname} eliminado.`)
            fetchClients(currentPage, search)
        } catch {
            toast.error('Error', 'No se pudo eliminar el cliente.')
        }
    }

    return (
        <div className='flex h-screen overflow-hidden bg-white/50'>
            <Sidebar
                userName={user?.name}
                userRole={user?.role === 'admin' ? 'Administrador' : 'Colaborador'}
                userAvatar={user?.avatarUrl}
            />

            <main className='flex-1 overflow-y-auto p-8'>
                <header className='mb-7 select-none'>
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Clientes</h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>Administre todos los clientes registrados en el sistema</p>
                </header>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className='mb-5 bg-orve-teal/10'>
                        <TabsTrigger value='list'   className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            Clientes
                        </TabsTrigger>
                        <TabsTrigger value='create' className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            <UserPlus className='w-4 h-4' />
                            Nuevo cliente
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Tab lista ── */}
                    <TabsContent value='list'>
                        <div className='flex flex-col gap-5'>
                            {/* Métricas */}
                            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                                <MetricCard icon={Users}      label='Total clientes activos'   value={metrics.totalActive}    />
                                <MetricCard icon={ShoppingBag} label='Interesados en compra'   value={metrics.interestedBuy}  />
                                <MetricCard icon={Home}        label='Interesados en alquiler'  value={metrics.interestedRent} />
                                <MetricCard icon={PhoneCall}   label='Pendientes de contacto'   value={metrics.pendingContact} highlight={metrics.pendingContact > 0} />
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
                                            placeholder='Buscar por cliente o propiedad'
                                            className='pl-9 bg-white/70'
                                        />
                                    </div>
                                </div>

                                <ClientsTable
                                    clients={clients}
                                    isLoading={isLoading}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />

                                {!isLoading && (
                                    <UsersPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        total={total}
                                        limit={LIMIT}
                                        entityLabel='clientes'
                                        onPageChange={(page) => fetchClients(page, search)}
                                    />
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── Tab crear ── */}
                    <TabsContent value='create'>
                        <div className={panel}>
                            <div className='mb-6'>
                                <h2 className='text-base font-semibold text-orve-teal'>Información del cliente</h2>
                                <p className='text-sm text-orve-teal/60 mt-0.5'>Ingrese la información del cliente</p>
                            </div>
                            <UserCreateForm
                                entityLabel='cliente'
                                onSubmit={handleCreate}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

export default Clients