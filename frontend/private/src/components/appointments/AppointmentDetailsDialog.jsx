import { Eye, Home, Wallet, MapPin, FileText } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import UserAvatar from '@/components/users/UserAvatar'
import { cn } from '@/lib/utils'
import { getStatus, FUNDS_SOURCE_LABELS, formatDate, formatCurrency } from './constants'

const InfoRow = ({ label, value }) => (
    <div className='flex flex-col gap-0.5'>
        <span className='text-xs text-orve-teal/50'>{label}</span>
        <span className='text-sm text-orve-darker-teal font-medium'>{value ?? '—'}</span>
    </div>
)

const SectionTitle = ({ icon: Icon, children }) => (
    <div className='flex items-center gap-2 text-orve-teal font-semibold text-sm'>
        <Icon className='w-4 h-4' />
        {children}
    </div>
)

const AppointmentDetailsDialog = ({ appointment: apt }) => {
    const status = getStatus(apt.status)
    const date = apt.scheduled_date ?? apt.proposed_dates?.[0]

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className='flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm text-orve-darker-teal hover:bg-orve-teal/10 transition-colors'>
                    <Eye className='w-3.5 h-3.5' /> Ver detalle
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalle de la cita</DialogTitle>
                    <DialogDescription>{apt.property?.title}</DialogDescription>
                </DialogHeader>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <UserAvatar
                            name={apt.buyer?.name}
                            lastname={apt.buyer?.lastname}
                            avatarUrl={apt.buyer?.picture}
                            className='w-11 h-11'
                        />
                        <div>
                            <p className='text-sm font-semibold text-orve-darker-teal'>{apt.buyer?.name} {apt.buyer?.lastname}</p>
                            <p className='text-xs text-orve-teal/60'>{apt.buyer?.email}</p>
                        </div>
                    </div>
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border shrink-0', status.className)}>
                        {status.label}
                    </span>
                </div>

                <Separator />

                <div className='flex flex-col gap-3'>
                    <SectionTitle icon={Home}>Propiedad y cita</SectionTitle>
                    <div className='grid grid-cols-2 gap-4'>
                        <InfoRow label='Propiedad' value={apt.property?.title} />
                        <InfoRow label='ID de propiedad' value={apt.property?.public_id} />
                        <InfoRow label='Fecha' value={formatDate(date)} />
                        <InfoRow label='Colaborador asignado' value={apt.collaborator ? `${apt.collaborator.name} ${apt.collaborator.lastname}` : null} />
                    </div>
                </div>

                <Separator />

                <div className='flex flex-col gap-3'>
                    <SectionTitle icon={Wallet}>Calificación financiera</SectionTitle>
                    <div className='grid grid-cols-2 gap-4'>
                        <InfoRow label='Fuente de fondos' value={FUNDS_SOURCE_LABELS[apt.qualification?.funds_source] ?? apt.qualification?.funds_source} />
                        <InfoRow label='Ingreso mensual' value={formatCurrency(apt.qualification?.monthly_income)} />
                    </div>
                    <InfoRow label='Motivo' value={apt.qualification?.reason} />
                </div>

                {apt.current_address?.reference && (
                    <>
                        <Separator />
                        <div className='flex flex-col gap-3'>
                            <SectionTitle icon={MapPin}>Dirección actual</SectionTitle>
                            <InfoRow label='Referencia' value={apt.current_address.reference} />
                        </div>
                    </>
                )}

                {apt.notes && (
                    <>
                        <Separator />
                        <div className='flex flex-col gap-3'>
                            <SectionTitle icon={FileText}>Notas</SectionTitle>
                            <p className='text-sm text-orve-darker-teal'>{apt.notes}</p>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AppointmentDetailsDialog
