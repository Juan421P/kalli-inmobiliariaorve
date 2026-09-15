import { useState, useEffect } from 'react'
import { UserPlus } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { appointmentOptionsService } from '@/services/AppointmentsService'
import toast from '@/lib/toast'

const AssignCollaboratorDialog = ({ appointment: apt, onAssign, isLoading }) => {
    const [open, setOpen] = useState(false)
    const [collaborators, setCollaborators] = useState([])
    const [isLoadingOptions, setIsLoadingOptions] = useState(false)
    const [selected, setSelected] = useState(apt.collaborator?._id ?? '')

    // Solo se cargan al abrir el diálogo, no en cada render de la tabla
    useEffect(() => {
        if (!open) return
        const loadCollaborators = async () => {
            setIsLoadingOptions(true)
            try {
                const data = await appointmentOptionsService.listCollaborators()
                setCollaborators(data)
            } catch {
                toast.error('Error', 'No se pudieron cargar los colaboradores.')
            } finally {
                setIsLoadingOptions(false)
            }
        }
        loadCollaborators()
    }, [open])

    const handleConfirm = async () => {
        if (!selected) return
        const ok = await onAssign(apt._id, selected)
        if (ok) setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className='flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm text-orve-darker-teal hover:bg-orve-teal/10 transition-colors'>
                    <UserPlus className='w-3.5 h-3.5' /> Asignar colaborador
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar colaborador</DialogTitle>
                    <DialogDescription>
                        Elige quién dará seguimiento a la cita de {apt.buyer?.name} {apt.buyer?.lastname}.
                    </DialogDescription>
                </DialogHeader>

                <Select value={selected} onValueChange={setSelected} disabled={isLoadingOptions}>
                    <SelectTrigger className='w-full bg-white/70'>
                        <SelectValue placeholder={isLoadingOptions ? 'Cargando...' : 'Seleccione un colaborador'} />
                    </SelectTrigger>
                    <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                        {collaborators.map((c) => (
                            <SelectItem key={c._id} value={c._id}>{c.name} {c.lastname} — {c.email}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant='outline' className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'>
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selected || isLoading}
                        className='bg-orve-teal hover:bg-orve-darker-teal text-white'
                    >
                        {isLoading ? 'Asignando...' : 'Asignar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AssignCollaboratorDialog
