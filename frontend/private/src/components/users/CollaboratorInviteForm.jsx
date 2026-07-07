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

const DOCUMENT_TYPES = [
    { value: 'dui',        label: 'DUI'        },
    { value: 'pasaporte',  label: 'Pasaporte'  },
    { value: 'residencia', label: 'Residencia' },
]

const EMPTY_FORM = {
    name:           '',
    lastname:       '',
    email:          '',
    phone:          '',
    documentType:   'dui',
    documentNumber: '',
}

const AvatarUpload = ({ preview, onChange, error }) => {
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
            {error && <span className='text-xs text-destructive'>{error}</span>}
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

const CollaboratorInviteForm = ({ onSubmit, isLoading }) => {
    const [form,   setForm]   = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [avatar, setAvatar] = useState({ file: null, preview: null })

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
        if (!avatar.file)                e.avatar         = 'La foto de perfil es requerida.'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        const ok = await onSubmit({
            name:           form.name.trim(),
            lastname:       form.lastname.trim(),
            email:          form.email.trim(),
            phone:          { country_code: '+503', number: form.phone.trim() },
            documentType:   form.documentType,
            documentNumber: form.documentNumber.trim(),
            avatarFile:     avatar.file,
        })
        if (ok) {
            setForm(EMPTY_FORM)
            setAvatar({ file: null, preview: null })
            setErrors({})
        }
    }

    return (
        <FieldSet>
            {/* ── Sección foto ── */}
            <div className='flex justify-center pb-2'>
                <AvatarUpload
                    preview={avatar.preview}
                    onChange={(file, preview) => { setAvatar({ file, preview }); setErrors((prev) => ({ ...prev, avatar: null })) }}
                    error={errors.avatar}
                />
            </div>

            <FieldSeparator />

            {/* ── Sección información personal ── */}
            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Información personal</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Nombre</FieldTitle>
                            <Input
                                value={form.name}
                                onChange={(e) => setField('name', e.target.value)}
                                placeholder='Ingrese el nombre del colaborador'
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
                                placeholder='Ingrese el apellido del colaborador'
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

            {/* ── Sección documento ── */}
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

            <p className='text-xs text-orve-teal/50 -mt-2'>
                Se enviará un correo de invitación para que el colaborador complete su cuenta y defina su propia contraseña.
            </p>

            {/* ── Acciones ── */}
            <div className='flex justify-end pt-2'>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className='bg-orve-teal hover:bg-orve-darker-teal text-white px-10'
                >
                    {isLoading ? 'Enviando...' : 'Enviar invitación'}
                </Button>
            </div>
        </FieldSet>
    )
}

export default CollaboratorInviteForm
