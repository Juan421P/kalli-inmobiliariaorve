import { Search, ShieldPlus } from 'lucide-react'
import Sidebar from '@/components/sidebar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { panel } from '@/lib/styles'
import useAdmins from '@/hooks/useAdmins'
import AdminsTable from '@/components/users/adminsTable'
import AdminInviteForm from '@/components/users/adminInviteForm'
import UsersPagination from '@/components/users/usersPagination'

const Admins = () => {
    const {
        admins, total, totalPages, currentPage,
        search, isLoading, isSubmitting, LIMIT,
        setSearch, setCurrentPage,
        createInvite,
    } = useAdmins()

    return (
        <div className='flex h-screen overflow-hidden bg-white/50'>
            <Sidebar />

            <main className='flex-1 overflow-y-auto p-8'>
                <header className='mb-7 select-none'>
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Administradores</h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>Administre el equipo de administradores</p>
                </header>

                <Tabs defaultValue='list'>
                    <TabsList className='mb-5 bg-orve-teal/10'>
                        <TabsTrigger value='list'   className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            Administradores
                        </TabsTrigger>
                        <TabsTrigger value='create' className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            <ShieldPlus className='w-4 h-4' />
                            Agregar administrador
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
                                        placeholder='Buscar administrador'
                                        className='pl-9 bg-white/70'
                                    />
                                </div>
                            </div>

                            {/* Tabla */}
                            <AdminsTable
                                admins={admins}
                                isLoading={isLoading}
                            />

                            {/* Paginación */}
                            {!isLoading && (
                                <UsersPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    total={total}
                                    limit={LIMIT}
                                    entityLabel='administradores'
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    </TabsContent>

                    {/* ── Tab crear ── */}
                    <TabsContent value='create'>
                        <div className={panel}>
                            <div className='mb-6'>
                                <h2 className='text-base font-semibold text-orve-teal'>Información del administrador</h2>
                                <p className='text-sm text-orve-teal/60 mt-0.5'>Ingrese la información del administrador</p>
                            </div>
                            <AdminInviteForm
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

export default Admins