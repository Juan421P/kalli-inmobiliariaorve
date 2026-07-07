import { UserCheck, UserX } from 'lucide-react'
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
import UserAvatar from './UserAvatar'

const DOC_BADGE_CLASS = {
    dui:        'bg-orve-teal/15 text-orve-darker-teal border-orve-teal/20',
    pasaporte:  'bg-blue-50 text-blue-700 border-blue-100',
    residencia: 'bg-purple-50 text-purple-700 border-purple-100',
    nit:        'bg-amber-50 text-amber-700 border-amber-100',
}

const DOC_TYPE_LABEL = {
    dui:        'DUI',
    pasaporte:  'Pasaporte',
    residencia: 'Residencia',
    nit:        'NIT',
}

const ClientsTable = ({ clients = [], isLoading, onToggleActive }) => {
    if (isLoading) {
        return (
            <div className='flex justify-center py-16'>
                <Spinner className='text-orve-teal size-6' />
            </div>
        )
    }

    if (clients.length === 0) {
        return (
            <Empty className='border-orve-teal/10'>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <span className='text-xl'>🙋</span>
                    </EmptyMedia>
                    <EmptyTitle className='text-orve-teal'>Sin clientes</EmptyTitle>
                    <EmptyDescription>No hay clientes que coincidan con la búsqueda.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className='border-orve-teal/10 hover:bg-transparent'>
                    <TableHead className='text-orve-teal font-semibold'>Cliente</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Correo</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Teléfono</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Documento</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Núm. Doc.</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Estado</TableHead>
                    <TableHead className='text-orve-teal font-semibold text-right'>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients.map((c) => {
                    const active = c.active !== false
                    return (
                        <TableRow key={c._id} className='border-orve-teal/10 hover:bg-orve-teal/[0.03]'>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <UserAvatar
                                        name={c.name}
                                        lastname={c.lastname}
                                        avatarUrl={c.picture}
                                        className='w-9 h-9'
                                    />
                                    <div className='flex flex-col'>
                                        <span className='text-sm font-medium text-orve-darker-teal'>{c.name}</span>
                                        <span className='text-sm text-orve-teal/60'>{c.lastname}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className='text-orve-teal/80 text-sm max-w-36 truncate'>
                                {c.email}
                            </TableCell>
                            <TableCell className='text-orve-teal/80 text-sm'>
                                {c.phone?.number ?? '—'}
                            </TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${DOC_BADGE_CLASS[c.document?.type] ?? ''}`}>
                                    {DOC_TYPE_LABEL[c.document?.type] ?? c.document?.type ?? '—'}
                                </span>
                            </TableCell>
                            <TableCell className='text-orve-teal/80 text-sm'>
                                {c.document?.number ?? '—'}
                            </TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${active ? 'bg-orve-green/10 text-orve-green border-orve-green/20' : 'bg-orve-red/10 text-orve-red border-orve-red/20'}`}>
                                    {active ? 'Activo' : 'Inactivo'}
                                </span>
                            </TableCell>
                            <TableCell className='text-right'>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant='ghost'
                                            size='icon-sm'
                                            title={active ? 'Desactivar' : 'Activar'}
                                            className={active
                                                ? 'text-orve-teal/50 hover:text-red-400 hover:bg-red-50'
                                                : 'text-orve-teal/50 hover:text-orve-green hover:bg-orve-green/10'}
                                        >
                                            {active ? <UserX className='w-3.5 h-3.5' /> : <UserCheck className='w-3.5 h-3.5' />}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent size='sm' className='bg-white'>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{active ? '¿Desactivar cliente?' : '¿Activar cliente?'}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {active
                                                    ? <>Se desactivará a <strong>{c.name} {c.lastname}</strong>. No podrá iniciar sesión hasta que se reactive su cuenta.</>
                                                    : <>Se reactivará a <strong>{c.name} {c.lastname}</strong>. Podrá volver a iniciar sesión normalmente.</>}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'>
                                                Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => onToggleActive(c, !active)}
                                                className={active
                                                    ? 'bg-red-500 text-white border-transparent hover:bg-red-600'
                                                    : '!bg-orve-green hover:!bg-orve-green/90 !text-white !border-transparent'}
                                            >
                                                {active ? 'Desactivar' : 'Activar'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

export default ClientsTable
