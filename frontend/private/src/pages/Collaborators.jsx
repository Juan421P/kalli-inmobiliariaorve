import { Search, UserPlus } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { panel } from '@/lib/styles'
import useCollaborators from '@/hooks/useCollaborators'
import CollaboratorsTable from '@/components/users/CollaboratorsTable'
import CollaboratorInviteForm from '@/components/users/CollaboratorInviteForm'
import UsersPagination from '@/components/users/UsersPagination'

const Collaborators = () => {
    const {
        collaborators, total, totalPages, currentPage,
        search, isLoading, isSubmitting, LIMIT,
        setSearch, setCurrentPage,
        createInvite, setActive,
    } = useCollaborators()

    const handleToggleActive = (collaborator, active) => setActive(collaborator._id, active)

    return (
        <div className='flex h-screen overflow-hidden bg-white/50'>
            <Sidebar />

            <main className='flex-1 overflow-y-auto p-8'>
                <header className='mb-7 select-none'>
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Colaboradores</h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>Administre el equipo de colaboradores</p>
                </header>

                <Tabs defaultValue='list'>
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
                                onToggleActive={handleToggleActive}
                            />

                            {/* Paginación */}
                            {!isLoading && (
                                <UsersPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    total={total}
                                    limit={LIMIT}
                                    entityLabel='colaboradores'
                                    onPageChange={setCurrentPage}
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
                            <CollaboratorInviteForm
                                onSubmit={createInvite}
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
