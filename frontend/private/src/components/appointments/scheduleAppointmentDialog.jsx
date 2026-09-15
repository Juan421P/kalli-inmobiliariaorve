import { useState } from 'react'
import { CalendarCheck } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { formatDate } from './constants'

const ScheduleAppointmentDialog = ({ appointment: apt, onSchedule, isLoading }) => {
    const [open, setOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)

    const proposedDates = apt.proposed_dates ?? []

    const handleConfirm = async () => {
        if (!selectedDate) return
        const ok = await onSchedule(apt._id, selectedDate)
        if (ok) setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className='flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm text-orve-darker-teal hover:bg-orve-teal/10 transition-colors'>
                    <CalendarCheck className='w-3.5 h-3.5' /> Confirmar fecha
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmar fecha de la cita</DialogTitle>
                    <DialogDescription>
                        Elige una de las fechas propuestas por {apt.buyer?.name} {apt.buyer?.lastname}.
                    </DialogDescription>
                </DialogHeader>

                {proposedDates.length === 0 ? (
                    <p className='text-sm text-orve-teal/50'>Esta cita no tiene fechas propuestas.</p>
                ) : (
                    <div className='flex flex-wrap gap-2'>
                        {proposedDates.map((date) => (
                            <button
                                type='button'
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                                    selectedDate === date
                                        ? 'bg-orve-teal text-white border-orve-teal'
                                        : 'bg-white/70 text-orve-teal border-orve-teal/20 hover:border-orve-teal hover:bg-orve-teal/5'
                                )}
                            >
                                {formatDate(date)}
                            </button>
                        ))}
                    </div>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant='outline' className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'>
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedDate || isLoading}
                        className='bg-orve-teal hover:bg-orve-darker-teal text-white'
                    >
                        {isLoading ? 'Confirmando...' : 'Confirmar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ScheduleAppointmentDialog
