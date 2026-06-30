import { useState, useRef } from 'react'
import { Upload, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const DOCUMENT_TYPES = [
    { value: 'dui',        label: 'DUI'        },
    { value: 'pasaporte',  label: 'Pasaporte'  },
    { value: 'residencia', label: 'Residencia' },
    { value: 'nit',        label: 'NIT'        },
]

const AvatarUpload = ({ preview, onChange }) => {
    const inputRef = useRef(null)

    const handleFile = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        onChange(file, URL.createObjectURL(file))
    }

    return (
        <div className='flex flex-col items-center gap-3'>
            <button
                type='button'
                onClick={() => inputRef.current?.click()}
                className='relative w-24 h-24 rounded-full border-2 border-dashed border-orve-teal/30 bg-orve-teal/5 hover:border-orve-teal/60 hover:bg-orve-teal/10 transition-all group overflow-hidden'
            >
                {preview ? (
                    <img src={preview} alt='Vista previa' className='w-full h-full object-cover' />
                ) : (
                    <div className='flex flex-col items-center justify-center gap-1 text-orve-teal/50 group-hover:text-orve-teal transition-colors'>
                        <User className='w-8 h-8' />
                    </div>
                )}
                {preview && (
                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                        <Upload className='w-5 h-5 text-white' />
                    </div>
                )}
            </button>
            <button
                type='button'
                onClick={() => inputRef.current?.click()}
                className='text-xs text-orve-teal/60 hover:text-orve-teal transition-colors'
            >
                {preview ? 'Cambiar foto' : 'Subir foto de perfil'}
            </button>
            <input
                ref={inputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleFile}
            />
        </div>
    )
}

const UserEditForm = ({ entityLabel = 'colaborador', initialData, onSubmit, onCancel, isLoading }) => {
    const [form, setForm] = useState({
        name:           initialData?.name            ?? '',
        lastname:       initialData?.lastname         ?? '',
        email:          initialData?.email            ?? '',
        phone:          initialData?.phone?.number    ?? '',
        documentType:   initialData?.document?.type   ?? 'dui',
        documentNumber: initialData?.document?.number ?? '',
    })
    const [errors,     setErrors]     = useState({})
    const [avatar,     setAvatar]     = useState({ file: null, preview: initialData?.avatarUrl ?? null })
    const [dialogOpen, setDialogOpen] = useState(false)

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => ({ ...prev, [key]: null }))
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim())           e.name           = 'El nombre es requerido.'
        if (!form.lastname.trim())       e.lastname       = 'El apellido es requerido.'
        if (!form.email.trim())          e.email          = 'El correo es requerido.'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido.'
        if (!form.phone.trim())          e.phone          = 'El teléfono es requerido.'
        if (!form.documentNumber.trim()) e.documentNumber = 'El número de documento es requerido.'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSaveClick = () => {
        if (!validate()) return
        setDialogOpen(true)
    }

    const handleConfirm = () => {
        onSubmit({
            name:     form.name.trim(),
            lastname: form.lastname.trim(),
            email:    form.email.trim(),
            phone:    { country_code: initialData?.phone?.country_code ?? '+503', number: form.phone.trim() },
            document: { type: form.documentType, number: form.documentNumber.trim() },
            avatar:   avatar.file,
        })
    }

    return (
        <FieldSet>

            {/* ── Avatar ── */}
            <div className='flex justify-center pb-2'>
                <AvatarUpload
                    preview={avatar.preview}
                    onChange={(file, preview) => setAvatar({ file, preview })}
                />
            </div>

            <FieldSeparator />

            {/* ── Información personal ── */}
            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Información personal</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Nombre</FieldTitle>
                            <Input
                                value={form.name}
                                onChange={(e) => setField('name', e.target.value)}
                                placeholder={`Nombre del ${entityLabel}`}
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.name}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Apellido</FieldTitle>
                            <Input
                                value={form.lastname}
                                onChange={(e) => setField('lastname', e.target.value)}
                                placeholder={`Apellido del ${entityLabel}`}
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.lastname}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Teléfono</FieldTitle>
                            <Input
                                value={form.phone}
                                onChange={(e) => setField('phone', e.target.value)}
                                placeholder='0000-0000'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.phone}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Correo electrónico</FieldTitle>
                            <Input
                                type='email'
                                value={form.email}
                                onChange={(e) => setField('email', e.target.value)}
                                placeholder='correo@ejemplo.com'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.email}</FieldError>
                    </Field>
                </div>
            </FieldGroup>

            <FieldSeparator />

            {/* ── Documento ── */}
            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Documento de identidad</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Tipo de documento</FieldTitle>
                            <Select
                                value={form.documentType}
                                onValueChange={(v) => setField('documentType', v)}
                            >
                                <SelectTrigger className='w-full bg-white/70'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {DOCUMENT_TYPES.map((dt) => (
                                        <SelectItem key={dt.value} value={dt.value}>
                                            {dt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldLabel>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Número de documento</FieldTitle>
                            <Input
                                value={form.documentNumber}
                                onChange={(e) => setField('documentNumber', e.target.value)}
                                placeholder='Ingrese el número de documento'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.documentNumber}</FieldError>
                    </Field>
                </div>
            </FieldGroup>

            {/* ── Acciones ── */}
            <div className='flex justify-end gap-3 pt-2'>
                <Button
                    variant='outline'
                    onClick={onCancel}
                    disabled={isLoading}
                    className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'
                >
                    Cancelar
                </Button>

                <Button
                    onClick={handleSaveClick}
                    disabled={isLoading}
                    className='bg-orve-teal hover:bg-orve-darker-teal text-white px-10'
                >
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </div>

            {/* ── Diálogo de confirmación ── */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent size='sm'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se actualizará la información de <strong>{form.name} {form.lastname}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='border-orve-teal/30 text-orve-teal hover:bg-orve-teal/10 hover:text-orve-teal'>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className='!bg-orve-teal hover:!bg-orve-darker-teal !text-white !border-transparent'
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </FieldSet>
    )
}

export default UserEditForm
