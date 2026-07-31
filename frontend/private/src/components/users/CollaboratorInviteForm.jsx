import { useState, useRef } from 'react'
import { Upload, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Field,
    FieldLabel,
    FieldTitle,
    FieldError,
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
        <div className='flex flex-col items-center gap-2'>
            <button
                type='button'
                onClick={() => inputRef.current?.click()}
                className='relative w-20 h-20 rounded-full border-2 border-dashed border-orve-teal/30 bg-orve-teal/5 hover:border-orve-teal/60 hover:bg-orve-teal/10 transition-all group overflow-hidden'
            >
                {preview ? (
                    <img src={preview} alt='Vista previa' className='w-full h-full object-cover' />
                ) : (
                    <div className='flex flex-col items-center justify-center gap-1 text-orve-teal/50 group-hover:text-orve-teal transition-colors'>
                        <User className='w-7 h-7' />
                    </div>
                )}
                {preview && (
                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                        <Upload className='w-4 h-4 text-white' />
                    </div>
                )}
            </button>
            <button
                type='button'
                onClick={() => inputRef.current?.click()}
                className='text-xs text-orve-teal/60 hover:text-orve-teal transition-colors'
            >
                {preview ? 'Cambiar foto' : 'Subir foto'}
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
    const [form,    setForm]    = useState(EMPTY_FORM)
    const [errors,  setErrors]  = useState({})
    const [touched, setTouched] = useState({})
    const [avatar,  setAvatar]  = useState({ file: null, preview: null })

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => ({ ...prev, [key]: null }))
    }

    const touchField = (key) => setTouched((prev) => ({ ...prev, [key]: true }))

    const isFormReady =
        form.name.trim() &&
        form.lastname.trim() &&
        form.email.trim() && /\S+@\S+\.\S+/.test(form.email) &&
        form.phone.trim() &&
        form.documentNumber.trim()

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
            setTouched({})
        }
    }

    return (
        <div className='flex flex-col gap-5'>
            {/* ── Avatar + campos lado a lado ── */}
            <div className='flex gap-6 items-start'>
                {/* Avatar */}
                <div className='shrink-0 pt-1'>
                    <AvatarUpload
                        preview={avatar.preview}
                        onChange={(file, preview) => {
                            setAvatar({ file, preview })
                            setErrors((prev) => ({ ...prev, avatar: null }))
                        }}
                        error={errors.avatar}
                    />
                </div>

                {/* Campos en cuadrícula 2 columnas */}
                <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Nombre
                                {touched.name && !form.name.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                            </FieldTitle>
                            <Input
                                value={form.name}
                                onChange={(e) => setField('name', e.target.value)}
                                onBlur={() => touchField('name')}
                                placeholder='Nombre'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.name}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Apellido
                                {touched.lastname && !form.lastname.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                            </FieldTitle>
                            <Input
                                value={form.lastname}
                                onChange={(e) => setField('lastname', e.target.value)}
                                onBlur={() => touchField('lastname')}
                                placeholder='Apellido'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.lastname}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Teléfono
                                {touched.phone && !form.phone.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                            </FieldTitle>
                            <Input
                                value={form.phone}
                                onChange={(e) => setField('phone', e.target.value)}
                                onBlur={() => touchField('phone')}
                                placeholder='0000-0000'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.phone}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Correo electrónico
                                {touched.email && !form.email.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                                {touched.email && form.email.trim() && !/\S+@\S+\.\S+/.test(form.email) && (
                                    <span className='text-orve-red text-xs font-semibold'>Formato inválido</span>
                                )}
                            </FieldTitle>
                            <Input
                                type='email'
                                value={form.email}
                                onChange={(e) => setField('email', e.target.value)}
                                onBlur={() => touchField('email')}
                                placeholder='correo@ejemplo.com'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.email}</FieldError>
                    </Field>

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
                            <FieldTitle className='text-orve-teal/70 flex items-center gap-2'>
                                Número de documento
                                {touched.documentNumber && !form.documentNumber.trim() && (
                                    <span className='text-orve-red text-xs font-semibold'>Requerido</span>
                                )}
                            </FieldTitle>
                            <Input
                                value={form.documentNumber}
                                onChange={(e) => setField('documentNumber', e.target.value)}
                                onBlur={() => touchField('documentNumber')}
                                placeholder='Número de documento'
                                className='bg-white/70'
                            />
                        </FieldLabel>
                        <FieldError>{errors.documentNumber}</FieldError>
                    </Field>
                </div>
            </div>

            {/* ── Nota + botón ── */}
            <div className='flex items-center justify-between gap-4 pt-1'>
                <p className='text-xs text-orve-teal/50'>
                    Se enviará un correo de invitación para que el colaborador defina su contraseña.
                </p>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !isFormReady}
                    className='shrink-0 bg-orve-teal hover:bg-orve-darker-teal text-white px-8'
                >
                    {isLoading ? 'Enviando...' : 'Enviar invitación'}
                </Button>
            </div>
        </div>
    )
}

export default CollaboratorInviteForm
