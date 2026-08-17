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
import UserAvatar from './UserAvatar'

const AdminsTable = ({ admins = [], isLoading }) => {
    if (isLoading) {
        return (
            <div className='flex justify-center py-16'>
                <Spinner className='text-orve-teal size-6' />
            </div>
        )
    }

    if (admins.length === 0) {
        return (
            <Empty className='border-orve-teal/10'>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <span className='text-xl'>🛡️</span>
                    </EmptyMedia>
                    <EmptyTitle className='text-orve-teal'>Sin administradores</EmptyTitle>
                    <EmptyDescription>No hay administradores que coincidan con la búsqueda.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className='border-orve-teal/10 hover:bg-transparent'>
                    <TableHead className='text-orve-teal font-semibold'>Administrador</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Correo</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Teléfono</TableHead>
                    <TableHead className='text-orve-teal font-semibold'>Documento</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {admins.map((a) => (
                    <TableRow key={a._id} className='border-orve-teal/10 hover:bg-orve-teal/[0.03]'>
                        <TableCell>
                            <div className='flex items-center gap-3'>
                                <UserAvatar
                                    name={a.name}
                                    lastname={a.lastname}
                                    avatarUrl={a.picture}
                                    className='w-9 h-9'
                                />
                                <div className='flex flex-col'>
                                    <span className='text-sm font-medium text-orve-darker-teal'>{a.name}</span>
                                    <span className='text-sm text-orve-teal/60'>{a.lastname}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className='text-orve-teal/80 text-sm'>
                            {a.email}
                        </TableCell>
                        <TableCell className='text-orve-teal/80 text-sm'>
                            {a.phone ? `${a.phone.country_code} ${a.phone.number}` : '—'}
                        </TableCell>
                        <TableCell className='text-orve-teal/80 text-sm'>
                            {a.document?.number ?? '—'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default AdminsTable