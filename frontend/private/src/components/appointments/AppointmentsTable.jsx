import { Home, MoreHorizontal, Pencil, CheckCircle2, XCircle } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import UserAvatar from '@/components/users/UserAvatar'
import AppointmentDetailsDialog from './AppointmentDetailsDialog'
import { cn } from '@/lib/utils'
import { getStatus, formatDate } from './constants'

const AppointmentsTable = ({ appointments = [], isLoading, onEdit, onComplete, onCancel }) => {
    if (isLoading) {
        return (
            <div className='flex justify-center py-16'>
                <Spinner className='text-orve-teal size-6' />
            </div>
        )
    }

    if (appointments.length === 0) {
        return (
            <Empty className='border-orve-teal/10'>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <span className='text-xl'>📅</span>
                    </EmptyMedia>
                    <EmptyTitle className='text-orve-teal'>Sin citas</EmptyTitle>
                    <EmptyDescription>No hay citas que coincidan con la búsqueda.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className='border-orve-teal/10 hover:bg-transparent'>
                    <TableHead className='text-orve-teal font-semibold'>Cliente</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Propiedad</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Fecha</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Colaborador asignado</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Estado</TableHead>
                    <TableHead className='text-orve-teal font-semibold text-right'>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {appointments.map((apt) => {
                    const status = getStatus(apt.status)
                    const canAct = apt.status === 'pending' || apt.status === 'assigned' || apt.status === 'scheduled'
                    const date = apt.scheduled_date ?? apt.proposed_dates?.[0]

                    return (
                        <TableRow key={apt._id} className='border-orve-teal/10 hover:bg-orve-teal/[0.03]'>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <UserAvatar
                                        name={apt.buyer?.name}
                                        lastname={apt.buyer?.lastname}
                                        avatarUrl={apt.buyer?.picture}
                                        className='w-9 h-9'
                                    />
                                    <span className='text-sm font-medium text-orve-darker-teal'>
                                        {apt.buyer?.name} {apt.buyer?.lastname}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-lg bg-orve-teal/10 flex items-center justify-center shrink-0'>
                                        <Home className='w-4 h-4 text-orve-teal' />
                                    </div>
                                    <div className='flex flex-col max-w-52'>
                                        <span className='text-sm font-medium text-orve-darker-teal truncate'>{apt.property?.title}</span>
                                        <span className='text-xs text-orve-teal/50'>ID: {apt.property?.public_id}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className='text-orve-teal/80 text-sm'>{formatDate(date)}</TableCell>
                            <TableCell className='text-orve-teal/80 text-sm'>
                                {apt.collaborator ? `${apt.collaborator.name} ${apt.collaborator.lastname}` : <span className='text-orve-teal/30'>—</span>}
                            </TableCell>
                            <TableCell>
                                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', status.className)}>
                                    {status.label}
                                </span>
                            </TableCell>
                            <TableCell className='text-right'>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='ghost'
                                            size='icon-sm'
                                            className='text-orve-teal/50 hover:text-orve-teal hover:bg-orve-teal/10'
                                        >
                                            <MoreHorizontal className='w-4 h-4' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='end' className='w-44 p-1 bg-white border border-input shadow-md'>
                                        <AppointmentDetailsDialog appointment={apt} />
                                        {canAct && (
                                            <>
                                                <button
                                                    onClick={() => onEdit?.(apt)}
                                                    className='flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm text-orve-darker-teal hover:bg-orve-teal/10 transition-colors'
                                                >
                                                    <Pencil className='w-3.5 h-3.5' /> Editar
                                                </button>
                                                <button
                                                    onClick={() => onComplete?.(apt)}
                                                    className='flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm text-orve-darker-teal hover:bg-orve-teal/10 transition-colors'
                                                >
                                                    <CheckCircle2 className='w-3.5 h-3.5' /> Marcar completada
                                                </button>
                                                <button
                                                    onClick={() => onCancel?.(apt)}
                                                    className='flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm text-orve-red hover:bg-red-50 transition-colors'
                                                >
                                                    <XCircle className='w-3.5 h-3.5' /> Cancelar
                                                </button>
                                            </>
                                        )}
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

export default AppointmentsTable
