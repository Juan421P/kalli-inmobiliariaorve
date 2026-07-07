import { useState } from 'react'
import { Search, SlidersHorizontal, CalendarPlus, Pencil, Calendar, Clock, CalendarCheck, CheckCircle2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import AppointmentMetricCard from '@/components/appointments/AppointmentMetricCard'
import AppointmentsTable from '@/components/appointments/AppointmentsTable'
import AppointmentCreateForm from '@/components/appointments/AppointmentCreateForm'
import UsersPagination from '@/components/users/UsersPagination'
import useAppointments from '@/hooks/use-appointments'
import { panel } from '@/lib/styles'

const STATUS_FILTERS = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'assigned', label: 'Asignada' },
    { value: 'scheduled', label: 'Confirmada' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
]

const Appointments = () => {
    const [tab, setTab] = useState('list')
    const [editingAppointment, setEditingAppointment] = useState(null)

    const {
        appointments, metrics, total, totalPages, currentPage,
        search, statusFilter, isLoading, isSubmitting, LIMIT,
        setSearch, setStatusFilter, setCurrentPage,
        updateStatus, createAppointment, editAppointment,
    } = useAppointments()

    const handleTabChange = (newTab) => {
        if (newTab !== 'update') setEditingAppointment(null)
        setTab(newTab)
    }

    const handleComplete = (apt) => updateStatus(apt._id, 'completed')
    const handleCancel = (apt) => updateStatus(apt._id, 'cancelled')

    const handleEdit = (apt) => {
        setEditingAppointment(apt)
        setTab('update')
    }

    const handleCreate = async (formData) => {
        const ok = await createAppointment(formData)
        if (ok) setTab('list')
        return ok
    }

    const handleUpdate = async (formData) => {
        const ok = await editAppointment(editingAppointment._id, formData)
        if (ok) {
            setTab('list')
            setEditingAppointment(null)
        }
        return ok
    }

    return (
        <div className='flex h-screen overflow-hidden bg-white/50'>
            <Sidebar />

            <main className='flex-1 overflow-y-auto p-8'>
                <header className='mb-7 select-none'>
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Citas</h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>Revisa, confirma o reagenda las solicitudes de citas</p>
                </header>

                <Tabs value={tab} onValueChange={handleTabChange}>
                    <TabsList className='mb-5 bg-orve-teal/10'>
                        <TabsTrigger value='list' className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            Citas
                        </TabsTrigger>
                        <TabsTrigger value='create' className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            <CalendarPlus className='w-4 h-4' />
                            Nueva cita
                        </TabsTrigger>
                        {editingAppointment && (
                            <TabsTrigger value='update' className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                                <Pencil className='w-4 h-4' />
                                Actualizar cita
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* ── Tab lista ── */}
                    <TabsContent value='list'>
                        <div className='flex flex-col gap-5'>
                            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                                <AppointmentMetricCard icon={Calendar} label='Total' value={metrics.total} />
                                <AppointmentMetricCard icon={Clock} label='Pendientes' value={metrics.pending} caption='por confirmar' highlight={metrics.pending > 0} />
                                <AppointmentMetricCard icon={CalendarCheck} label='Confirmadas' value={metrics.confirmed} caption='programadas' />
                                <AppointmentMetricCard icon={CheckCircle2} label='Completadas' value={metrics.completed} caption='en total' />
                            </div>

                            <div className={panel}>
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

                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className='w-36 bg-white/70 border-input text-orve-darker-teal'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                            {STATUS_FILTERS.map(({ value, label }) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant='outline'
                                        size='icon'
                                        title='Más filtros'
                                        className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10'
                                    >
                                        <SlidersHorizontal className='w-4 h-4' />
                                    </Button>
                                </div>

                                <AppointmentsTable
                                    appointments={appointments}
                                    isLoading={isLoading}
                                    onEdit={handleEdit}
                                    onComplete={handleComplete}
                                    onCancel={handleCancel}
                                />

                                {!isLoading && (
                                    <UsersPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        total={total}
                                        limit={LIMIT}
                                        entityLabel='citas'
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── Tab crear ── */}
                    <TabsContent value='create'>
                        <div className={panel}>
                            <div className='mb-6'>
                                <h2 className='text-base font-semibold text-orve-teal'>Información de la cita</h2>
                                <p className='text-sm text-orve-teal/60 mt-0.5'>Agende una cita en nombre de un cliente</p>
                            </div>
                            <AppointmentCreateForm
                                onSubmit={handleCreate}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </TabsContent>

                    {/* ── Tab actualizar ── */}
                    <TabsContent value='update'>
                        {editingAppointment && (
                            <div className={panel}>
                                <div className='mb-6'>
                                    <h2 className='text-base font-semibold text-orve-teal'>Actualizar cita</h2>
                                    <p className='text-sm text-orve-teal/60 mt-0.5'>
                                        Modifique la cita de {editingAppointment.buyer?.name} {editingAppointment.buyer?.lastname}
                                    </p>
                                </div>
                                <AppointmentCreateForm
                                    initialData={editingAppointment}
                                    onSubmit={handleUpdate}
                                    onCancel={() => { setTab('list'); setEditingAppointment(null) }}
                                    isLoading={isSubmitting}
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

export default Appointments
