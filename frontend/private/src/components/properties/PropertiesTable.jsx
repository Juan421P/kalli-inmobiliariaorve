import { Pencil, Trash2, Home, Building2, LandPlot } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// ─── Configuraciones visuales ─────────────────────────────────────────────────
const TYPE_CONFIG = {
    house:     { label: 'Casa',        icon: Home,      cls: 'bg-orve-teal/10 text-orve-darker-teal border-orve-teal/20' },
    apartment: { label: 'Apartamento', icon: Building2, cls: 'bg-blue-50 text-blue-700 border-blue-100'                  },
    land:      { label: 'Terreno',     icon: LandPlot,  cls: 'bg-amber-50 text-amber-700 border-amber-100'              },
}

const LISTING_CONFIG = {
    sale: { label: 'Venta',    cls: 'bg-purple-50 text-purple-700 border-purple-100' },
    rent: { label: 'Alquiler', cls: 'bg-sky-50 text-sky-700 border-sky-100'          },
}

const STATUS_CONFIG = {
    available: { label: 'Disponible', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    occupied:  { label: 'Ocupado',    cls: 'bg-amber-50 text-amber-700 border-amber-100'       },
}

const formatPrice = (price, listing_type) => {
    if (listing_type === 'rent') return `$${price.toLocaleString()}/mes`
    if (price >= 1000) return `$${(price / 1000).toLocaleString('es', { maximumFractionDigits: 0 })}k`
    return `$${price.toLocaleString()}`
}

// Se parsea manualmente para evitar el desfase de zona horaria que introduce new Date() con strings ISO
const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${parseInt(d)} de ${months[parseInt(m) - 1]}, ${y}`
}

const CollaboratorCell = ({ collaborator }) => {
    if (!collaborator) return <span className='text-orve-teal/30 text-xs'>Sin asignar</span>
    const initials = `${collaborator.name?.[0] ?? ''}${collaborator.lastname?.[0] ?? ''}`.toUpperCase()
    return (
        <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-full bg-orve-teal/15 flex items-center justify-center shrink-0'>
                {collaborator.avatarUrl ? (
                    <img src={collaborator.avatarUrl} alt='' className='w-full h-full object-cover rounded-full' />
                ) : (
                    <span className='text-[10px] font-semibold text-orve-teal'>{initials}</span>
                )}
            </div>
            <span className='text-sm text-orve-teal/80 leading-tight'>{collaborator.name}</span>
        </div>
    )
}

// ─── Tabla ────────────────────────────────────────────────────────────────────
const PropertiesTable = ({ properties = [], isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <div className='flex justify-center py-16'>
                <Spinner className='text-orve-teal size-6' />
            </div>
        )
    }

    if (properties.length === 0) {
        return (
            <Empty className='border-orve-teal/10'>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <Building2 className='w-5 h-5 text-orve-teal/50' />
                    </EmptyMedia>
                    <EmptyTitle className='text-orve-teal'>Sin propiedades</EmptyTitle>
                    <EmptyDescription>No hay propiedades que coincidan con la búsqueda.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className='border-orve-teal/10 hover:bg-transparent'>
                    <TableHead className='text-orve-teal font-semibold'>Propiedad</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Tipo</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Ubicación</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Precio</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Estado</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Colaborador</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Fecha</TableHead>
                    <TableHead className='text-orve-teal font-semibold text-right'>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {properties.map((p) => {
                    const typeConf    = TYPE_CONFIG[p.property_type]    ?? TYPE_CONFIG.house
                    const listConf    = LISTING_CONFIG[p.listing_type]  ?? LISTING_CONFIG.sale
                    const statusConf  = STATUS_CONFIG[p.status]         ?? STATUS_CONFIG.available
                    const TypeIcon    = typeConf.icon

                    return (
                        <TableRow key={p._id} className='border-orve-teal/10 hover:bg-orve-teal/[0.03]'>
                            {/* Propiedad */}
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-lg bg-orve-teal/10 flex items-center justify-center shrink-0'>
                                        <TypeIcon className='w-5 h-5 text-orve-teal/60' />
                                    </div>
                                    <div className='flex flex-col min-w-0'>
                                        <span className='text-sm font-medium text-orve-darker-teal truncate max-w-48'>
                                            {p.title}
                                        </span>
                                        <span className='text-xs text-orve-teal/40'>{p.code}</span>
                                    </div>
                                </div>
                            </TableCell>

                            {/* Tipo + listado */}
                            <TableCell>
                                <div className='flex flex-col gap-1'>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${typeConf.cls}`}>
                                        {typeConf.label}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${listConf.cls}`}>
                                        {listConf.label}
                                    </span>
                                </div>
                            </TableCell>

                            {/* Ubicación */}
                            <TableCell className='text-sm text-orve-teal/70 max-w-44'>
                                <span className='line-clamp-2 leading-tight'>{p.address}</span>
                            </TableCell>

                            {/* Precio */}
                            <TableCell>
                                <span className='text-sm font-semibold text-orve-darker-teal'>
                                    {formatPrice(p.price, p.listing_type)}
                                </span>
                            </TableCell>

                            {/* Estado */}
                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusConf.cls}`}>
                                    {statusConf.label}
                                </span>
                            </TableCell>

                            {/* Colaborador */}
                            <TableCell>
                                <CollaboratorCell collaborator={p.collaborator} />
                            </TableCell>

                            {/* Fecha */}
                            <TableCell className='text-xs text-orve-teal/60 whitespace-nowrap'>
                                {formatDate(p.createdAt)}
                            </TableCell>

                            {/* Acciones */}
                            <TableCell className='text-right'>
                                <div className='flex items-center justify-end gap-1'>
                                    <Button
                                        variant='ghost'
                                        size='icon-sm'
                                        onClick={() => onEdit(p)}
                                        className='text-orve-teal/50 hover:text-orve-teal hover:bg-orve-teal/10'
                                    >
                                        <Pencil className='w-3.5 h-3.5' />
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon-sm'
                                                className='text-orve-teal/50 hover:text-red-400 hover:bg-red-50'
                                            >
                                                <Trash2 className='w-3.5 h-3.5' />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent size='sm'>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar propiedad?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Se eliminará permanentemente <strong>{p.title}</strong>. Esta acción no se puede deshacer.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'>
                                                    Cancelar
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => onDelete(p)}
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

export default PropertiesTable
