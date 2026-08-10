import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import ScheduleForm from '@/components/schedules/scheduleForm'
import ScheduleTable from '@/components/schedules/scheduleTable'
import { Spinner } from '@/components/ui/spinner'
import { scheduleService } from '@/services/ScheduleService'
import toast from '@/lib/toast'
import useAuth from '@/hooks/useAuth'

const Schedules = () => {
    const { user } = useAuth()

    const [schedules,     setSchedules]     = useState([])
    const [isLoading,     setIsLoading]     = useState(true)
    const [isSubmitting,  setIsSubmitting]  = useState(false)
    const [editingSlot,   setEditingSlot]   = useState(null)
    // editingSlot: { slotId, day, from, to } | null

    // Carga inicial
    useEffect(() => {
        const fetchSchedules = async () => {
            setIsLoading(true)
            try {
                const data = await scheduleService.get()
                setSchedules(data.schedules ?? [])
            } catch {
                toast.error('Error al cargar', 'No se pudieron cargar los horarios.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchSchedules()
    }, [])

    // Agregar slot
    const handleAdd = async (day, from, to) => {
        setIsSubmitting(true)
        try {
            const data = await scheduleService.addSlot(day, from, to)
            setSchedules((prev) =>
                prev.map((d) =>
                    d.day === day
                        ? { ...d, slots: [...d.slots, data.slot] }
                        : d
                )
            )
            toast.success('Horario agregado correctamente.')
        } catch {
            toast.error('Error', 'No se pudo agregar el horario.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Editar slot
    // Al hacer clic en el lápiz de una fila, tomamos el primer slot para editar
    const handleEditClick = (dayEntry, slot) => {
        setEditingSlot({
            slotId: slot._id,
            day:    dayEntry.day,
            from:   slot.from,
            to:     slot.to,
        })
    }

    const handleUpdate = async (slotId, from, to) => {
        setIsSubmitting(true)
        try {
            await scheduleService.updateSlot(slotId, from, to)
            setSchedules((prev) =>
                prev.map((d) => ({
                    ...d,
                    slots: d.slots.map((s) =>
                        s._id === slotId ? { ...s, from, to } : s
                    ),
                }))
            )
            setEditingSlot(null)
            toast.success('Horario actualizado correctamente.')
        } catch {
            toast.error('Error', 'No se pudo actualizar el horario.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Eliminar un slot individual
    const handleDeleteSlot = async (slotId) => {
        setIsSubmitting(true)
        try {
            await scheduleService.deleteSlot(slotId)
            setSchedules((prev) =>
                prev.map((d) => ({
                    ...d,
                    slots: d.slots.filter((s) => s._id !== slotId),
                }))
            )
            toast.success('Horario eliminado.')
        } catch {
            toast.error('Error', 'No se pudo eliminar el horario.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Eliminar todos los slots de un día
    const handleDelete = async (dayEntry) => {
        if (dayEntry.slots.length === 0) return
        setIsSubmitting(true)
        try {
            // Elimina todos los slots del día en secuencia
            for (const slot of dayEntry.slots) {
                await scheduleService.deleteSlot(slot._id)
            }
            setSchedules((prev) =>
                prev.map((d) =>
                    d.day === dayEntry.day ? { ...d, slots: [] } : d
                )
            )
            toast.success(`Horarios de ${dayEntry.day} eliminados.`)
        } catch {
            toast.error('Error', 'No se pudieron eliminar los horarios.')
        } finally {
            setIsSubmitting(false)
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
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>
                        Horarios disponibles
                    </h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>
                        Agrega los períodos de tiempo disponibles.
                    </p>
                </header>

                <div className='flex flex-col gap-5'>
                    <ScheduleForm
                        onAdd={handleAdd}
                        onUpdate={handleUpdate}
                        editingSlot={editingSlot}
                        onCancelEdit={() => setEditingSlot(null)}
                        isLoading={isSubmitting}
                    />

                    {isLoading ? (
                        <div className='flex justify-center py-16'>
                            <Spinner className='text-orve-teal' />
                        </div>
                    ) : (
                        <ScheduleTable
                            schedules={schedules}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                            onDeleteSlot={handleDeleteSlot}
                            loadingSlotId={isSubmitting}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

export default Schedules