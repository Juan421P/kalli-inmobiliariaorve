import { useState, useEffect, useCallback } from 'react'
import { Search, UserPlus } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { panel } from '@/lib/styles'
import toast from '@/lib/toast'
import useAuth from '@/hooks/use-auth'
import { collaboratorsService } from '@/services/collaborator'
import CollaboratorsTable from '@/components/users/CollaboratorsTable'
import UserCreateForm from '@/components/users/UserCreateForm'
import UsersPagination from '@/components/users/UsersPagination'

const LIMIT = 5

const Collaborators = () => {
    const { user } = useAuth()

    const [tab,             setTab]             = useState('list')
    const [collaborators,   setCollaborators]   = useState([])
    const [total,           setTotal]           = useState(0)
    const [currentPage,     setCurrentPage]     = useState(1)
    const [search,          setSearch]          = useState('')
    const [isLoading,       setIsLoading]       = useState(true)
    const [isSubmitting,    setIsSubmitting]    = useState(false)

    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchCollaborators = useCallback(async (page = 1, q = search) => {
        setIsLoading(true)
        try {
            const data = await collaboratorsService.getAll({ search: q, page, limit: LIMIT })
            setCollaborators(data.collaborators)
            setTotal(data.total)
            setCurrentPage(page)
        } catch {
            toast.error('Error', 'No se pudieron cargar los colaboradores.')
        } finally {
            setIsLoading(false)
        }
    }, [search])

    useEffect(() => {
        fetchCollaborators(1, '')
    }, [])

    // Búsqueda con debounce simple
    useEffect(() => {
        const timer = setTimeout(() => fetchCollaborators(1, search), 400)
        return () => clearTimeout(timer)
    }, [search])

    // ── Crear ──────────────────────────────────────────────────────────────────
    const handleCreate = async (formData) => {
        setIsSubmitting(true)
        try {
            await collaboratorsService.create(formData)
            toast.success('Colaborador agregado correctamente.')
            setTab('list')
            fetchCollaborators(1, '')
        } catch {
            toast.error('Error', 'No se pudo agregar el colaborador.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // ── Editar (placeholder — implementar según diseño definitivo) ─────────────
    const handleEdit = (collaborator) => {
        toast('Próximamente', { description: `Editar a ${collaborator.name} ${collaborator.lastname}` })
    }

    // ── Eliminar ───────────────────────────────────────────────────────────────
    const handleDelete = async (collaborator) => {
        try {
            await collaboratorsService.remove(collaborator._id)
            toast.success(`${collaborator.name} ${collaborator.lastname} eliminado.`)
            fetchCollaborators(currentPage, search)
        } catch {
            toast.error('Error', 'No se pudo eliminar el colaborador.')
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
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Colaboradores</h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>Administre el equipo de colaboradores</p>
                </header>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className='mb-5 bg-orve-teal/10'>
                        <TabsTrigger value='list'   className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            Colaboradores
                        </TabsTrigger>
                        <TabsTrigger value='create' className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            <UserPlus className='w-4 h-4' />
                            Agregar colaborador
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Tab lista ── */}
                    <TabsContent value='list'>
                        <div className={panel}>
                            {/* Buscador */}
                            <div className='flex items-center gap-3 mb-5'>
                                <div className='relative flex-1 max-w-md'>
                                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orve-teal/40' />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder='Buscar colaborador'
                                        className='pl-9 bg-white/70'
                                    />
                                </div>
                            </div>

                            {/* Tabla */}
                            <CollaboratorsTable
                                collaborators={collaborators}
                                isLoading={isLoading}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                            {/* Paginación */}
                            {!isLoading && (
                                <UsersPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    total={total}
                                    limit={LIMIT}
                                    entityLabel='colaboradores'
                                    onPageChange={(page) => fetchCollaborators(page, search)}
                                />
                            )}
                        </div>
                    </TabsContent>

                    {/* ── Tab crear ── */}
                    <TabsContent value='create'>
                        <div className={panel}>
                            <div className='mb-6'>
                                <h2 className='text-base font-semibold text-orve-teal'>Información del colaborador</h2>
                                <p className='text-sm text-orve-teal/60 mt-0.5'>Ingrese la información del colaborador</p>
                            </div>
                            <UserCreateForm
                                entityLabel='colaborador'
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

export default Collaborators