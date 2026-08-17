import { CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription,
} from '@/components/ui/empty'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import UserAvatar from '@/components/users/userAvatar'

// colores y etiquetas según el estado de la oferta
const STATUS_MAP = {
    pending:   { label: 'Pendiente',       className: 'bg-amber-50   text-amber-700   border-amber-200'   },
    accepted:  { label: 'Aceptada',        className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected:  { label: 'Rechazada',       className: 'bg-red-50     text-red-600     border-red-200'     },
    countered: { label: 'Contrapropuesta', className: 'bg-blue-50    text-blue-700    border-blue-200'    },
    withdrawn: { label: 'Retirada',        className: 'bg-gray-50    text-gray-500    border-gray-200'    },
}

const formatCurrency = (value) =>
    typeof value === 'number'
        ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        : value

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const OffersTable = ({ offers = [], isLoading, onStatusChange, onDelete }) => {
    if (isLoading) {
        return (
            <div className='flex justify-center py-16'>
                <Spinner className='text-orve-teal size-6' />
            </div>
        )
    }

    if (offers.length === 0) {
        return (
            <Empty className='border-orve-teal/10'>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <span className='text-xl'></span>
                    </EmptyMedia>
                    <EmptyTitle className='text-orve-teal'>Sin ofertas</EmptyTitle>
                    <EmptyDescription>No hay ofertas que coincidan con la búsqueda.</EmptyDescription>
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
                    <TableHead className='text-orve-teal font-semibold'>Oferta</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Estado</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Fecha Mudanza</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Meses de Alquiler</TableHead>
                    <TableHead className='text-orve-teal font-semibold text-right'>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {offers.map((o) => {
                    const status = STATUS_MAP[o.status] ?? { label: o.status, className: 'bg-gray-100 text-gray-500 border-gray-200' }
                    // solo se puede aceptar o rechazar si la oferta está pendiente o en contrapropuesta
                    const canAct = o.status === 'pending' || o.status === 'countered'

                    return (
                        <TableRow key={o._id} className='border-orve-teal/10 hover:bg-orve-teal/[0.03]'>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <UserAvatar
                                        name={o.buyer?.name}
                                        lastname={o.buyer?.lastname}
                                        avatarUrl={o.buyer?.picture}
                                        className='w-9 h-9'
                                    />
                                    <div className='flex flex-col'>
                                        <span className='text-sm font-medium text-orve-darker-teal'>{o.buyer?.name ?? '—'}</span>
                                        <span className='text-sm text-orve-teal/60'>{o.buyer?.lastname ?? '—'}</span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className='max-w-52'>
                                <div className='flex flex-col'>
                                    <span className='text-sm font-medium text-orve-darker-teal truncate max-w-48'>{o.property?.title ?? '—'}</span>
                                    <span className='text-xs text-orve-teal/50'>ID: {o.property?.public_id ?? '—'}</span>
                                </div>
                            </TableCell>

                            <TableCell className='text-sm font-semibold text-orve-teal'>
                                {formatCurrency(o.price)}
                            </TableCell>

                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${status.className}`}>
                                    {status.label}
                                </span>
                            </TableCell>

                            <TableCell className='text-orve-teal/80 text-sm'>
                                {formatDate(o.move_in_date)}
                            </TableCell>

                            <TableCell className='text-orve-teal/80 text-sm'>
                                {o.rental_months ? `${o.rental_months}M` : '—'}
                            </TableCell>

                            <TableCell className='text-right'>
                                <div className='flex items-center justify-end gap-1'>
                                    {canAct && (
                                        <>
                                            <Button
                                                variant='ghost'
                                                size='icon-sm'
                                                title='Aceptar oferta'
                                                onClick={() => onStatusChange(o._id, 'accepted')}
                                                className='text-orve-teal/50 hover:text-emerald-600 hover:bg-emerald-50'
                                            >
                                                <CheckCircle2 className='w-3.5 h-3.5' />
                                            </Button>
                                            <Button
                                                variant='ghost'
                                                size='icon-sm'
                                                title='Rechazar oferta'
                                                onClick={() => onStatusChange(o._id, 'rejected')}
                                                className='text-orve-teal/50 hover:text-red-400 hover:bg-red-50'
                                            >
                                                <XCircle className='w-3.5 h-3.5' />
                                            </Button>
                                        </>
                                    )}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon-sm'
                                                title='Eliminar oferta'
                                                className='text-orve-teal/50 hover:text-red-400 hover:bg-red-50'
                                            >
                                                <Trash2 className='w-3.5 h-3.5' />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent size='sm'>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar oferta?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Se eliminará la oferta de <strong>{o.buyer?.name} {o.buyer?.lastname}</strong> por <strong>{formatCurrency(o.price)}</strong>. Esta acción no se puede deshacer.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'>
                                                    Cancelar
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => onDelete(o._id)}
                                                    className='bg-red-500 text-white border-transparent hover:bg-red-600'
                                                >
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

export default OffersTable
