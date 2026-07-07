import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Field,
    FieldLabel,
    FieldTitle,
    FieldError,
    FieldGroup,
    FieldSet,
    FieldLegend,
    FieldSeparator,
} from '@/components/ui/field'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { appointmentOptionsService } from '@/services/appointments'
import toast from '@/lib/toast'

const FUNDS_SOURCES = [
    { value: 'own',  label: 'Fondos propios' },
    { value: 'loan', label: 'Préstamo' },
    { value: 'mixed', label: 'Mixto' },
]

const EMPTY_FORM = {
    buyer:            '',
    property:         '',
    proposedDate:     '',
    fundsSource:      'own',
    monthlyIncome:    '',
    reason:           '',
    addressReference: '',
    notes:            '',
}

const toDateInputValue = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toISOString().slice(0, 10)
}

const formFromInitialData = (initialData) => initialData ? {
    buyer:            initialData.buyer?._id ?? '',
    property:         initialData.property?._id ?? '',
    proposedDate:     toDateInputValue(initialData.scheduled_date ?? initialData.proposed_dates?.[0]),
    fundsSource:      initialData.qualification?.funds_source ?? 'own',
    monthlyIncome:    initialData.qualification?.monthly_income?.toString() ?? '',
    reason:           initialData.qualification?.reason ?? '',
    addressReference: initialData.current_address?.reference ?? '',
    notes:            initialData.notes ?? '',
} : EMPTY_FORM

const AppointmentCreateForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const isEditing = Boolean(initialData)
    const [form,   setForm]   = useState(() => formFromInitialData(initialData))
    const [errors, setErrors] = useState({})
    const [clients,    setClients]    = useState([])
    const [properties, setProperties] = useState([])
    const [isLoadingOptions, setIsLoadingOptions] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        const loadOptions = async () => {
            setIsLoadingOptions(true)
            try {
                const [clientsData, propertiesData] = await Promise.all([
                    appointmentOptionsService.listClients(),
                    appointmentOptionsService.listProperties(),
                ])
                setClients(clientsData)
                setProperties(propertiesData)
            } catch {
                toast.error('Error', 'No se pudieron cargar los clientes o propiedades.')
            } finally {
                setIsLoadingOptions(false)
            }
        }
        loadOptions()
    }, [])

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => ({ ...prev, [key]: null }))
    }

    const validate = () => {
        const e = {}
        if (!form.buyer)                     e.buyer = 'Seleccione un cliente.'
        if (!form.property)                  e.property = 'Seleccione una propiedad.'
        if (!form.proposedDate)              e.proposedDate = 'Seleccione una fecha.'
        if (!form.monthlyIncome)             e.monthlyIncome = 'El ingreso mensual es requerido.'
        else if (Number(form.monthlyIncome) < 0) e.monthlyIncome = 'Debe ser un valor positivo.'
        if (!form.reason.trim())             e.reason = 'El motivo es requerido.'
        if (!form.addressReference.trim())   e.addressReference = 'La referencia de dirección es requerida.'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const submit = async () => {
        const ok = await onSubmit(form)
        if (ok && !isEditing) {
            setForm(EMPTY_FORM)
            setErrors({})
        }
    }

    const handleSaveClick = () => {
        if (!validate()) return
        if (isEditing) setDialogOpen(true)
        else submit()
    }

    const clientLabel = (id) => {
        const c = clients.find((client) => client._id === id)
        return c ? `${c.name} ${c.lastname}` : ''
    }

    return (
        <FieldSet>
            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Cliente y propiedad</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Cliente</FieldTitle>
                            <Select value={form.buyer} onValueChange={(v) => setField('buyer', v)} disabled={isLoadingOptions}>
                                <SelectTrigger className='w-full bg-white/70'>
                                    <SelectValue placeholder={isLoadingOptions ? 'Cargando...' : 'Seleccione un cliente'} />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {clients.map((c) => (
                                        <SelectItem key={c._id} value={c._id}>{c.name} {c.lastname} — {c.email}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                        <FieldError>{errors.buyer}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Propiedad</FieldTitle>
                            <Select value={form.property} onValueChange={(v) => setField('property', v)} disabled={isLoadingOptions}>
                                <SelectTrigger className='w-full bg-white/70'>
                                    <SelectValue placeholder={isLoadingOptions ? 'Cargando...' : 'Seleccione una propiedad'} />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {properties.map((p) => (
                                        <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                        <FieldError>{errors.property}</FieldError>
                    </Field>
                </div>
            </FieldGroup>

            <FieldSeparator />

            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Detalles de la cita</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Fecha propuesta</FieldTitle>
                            <Input
                                type='date'
                                value={form.proposedDate}
                                onChange={(e) => setField('proposedDate', e.target.value)}
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.proposedDate}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Referencia de dirección actual</FieldTitle>
                            <Input
                                value={form.addressReference}
                                onChange={(e) => setField('addressReference', e.target.value)}
                                placeholder='Ej. Cerca de la gasolinera central'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.addressReference}</FieldError>
                    </Field>
                </div>
            </FieldGroup>

            <FieldSeparator />

            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Calificación financiera</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Fuente de fondos</FieldTitle>
                            <Select value={form.fundsSource} onValueChange={(v) => setField('fundsSource', v)}>
                                <SelectTrigger className='w-full bg-white/70'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {FUNDS_SOURCES.map((f) => (
                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Ingreso mensual (USD)</FieldTitle>
                            <Input
                                type='number'
                                min='0'
                                value={form.monthlyIncome}
                                onChange={(e) => setField('monthlyIncome', e.target.value)}
                                placeholder='0.00'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.monthlyIncome}</FieldError>
                    </Field>
                </div>

                <Field>
                    <FieldLabel>
                        <FieldTitle className='text-orve-teal/70'>Motivo</FieldTitle>
                        <Textarea
                            value={form.reason}
                            onChange={(e) => setField('reason', e.target.value)}
                            placeholder='Ej. Busca su primera casa propia.'
                            className='bg-white/70'
                        />
                    </FieldLabel>
                    <FieldError>{errors.reason}</FieldError>
                </Field>
            </FieldGroup>

            <FieldSeparator />

            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Notas (opcional)</FieldLegend>
                <Field>
                    <FieldLabel>
                        <Textarea
                            value={form.notes}
                            onChange={(e) => setField('notes', e.target.value)}
                            placeholder='Notas internas sobre la cita'
                            className='bg-white/70'
                        />
                    </FieldLabel>
                </Field>
            </FieldGroup>

            <div className='flex justify-end gap-3 pt-2'>
                {isEditing && (
                    <Button
                        variant='outline'
                        onClick={onCancel}
                        disabled={isLoading}
                        className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    onClick={handleSaveClick}
                    disabled={isLoading}
                    className='bg-orve-teal hover:bg-orve-darker-teal text-white px-10'
                >
                    {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar'}
                </Button>
            </div>

            {isEditing && (
                <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent size='sm'>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Se actualizará la cita de <strong>{clientLabel(form.buyer)}</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'>
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={submit}
                                className='!bg-orve-teal hover:!bg-orve-darker-teal !text-white !border-transparent'
                            >
                                Confirmar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </FieldSet>
    )
}

export default AppointmentCreateForm
