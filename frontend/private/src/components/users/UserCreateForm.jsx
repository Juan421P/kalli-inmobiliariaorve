import { useState, useRef } from 'react'
import { Eye, EyeOff, Upload, User } from 'lucide-react'
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

// ─── Constantes ───────────────────────────────────────────────────────────────
const DOCUMENT_TYPES = [
    { value: 'dui',        label: 'DUI'        },
    { value: 'pasaporte',  label: 'Pasaporte'  },
    { value: 'residencia', label: 'Residencia' },
    { value: 'nit',        label: 'NIT'        },
]

const EMPTY_FORM = {
    name:            '',
    lastname:        '',
    email:           '',
    phone:           '',
    documentType:    'dui',
    documentNumber:  '',
    password:        '',
    confirmPassword: '',
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────
const AvatarUpload = ({ preview, onChange }) => {
    const inputRef = useRef(null)

    const handleFile = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        onChange(file, url)
    }

    return (
        <div className='flex flex-col items-center gap-3'>
            <button
                type='button'
                onClick={() => inputRef.current?.click()}
                className='relative w-24 h-24 rounded-full border-2 border-dashed border-orve-teal/30 bg-orve-teal/5 hover:border-orve-teal/60 hover:bg-orve-teal/10 transition-all group overflow-hidden'
            >
                {preview ? (
                    <img
                        src={preview}
                        alt='Vista previa'
                        className='w-full h-full object-cover'
                    />
                ) : (
                    <div className='flex flex-col items-center justify-center gap-1 text-orve-teal/50 group-hover:text-orve-teal transition-colors'>
                        <User className='w-8 h-8' />
                    </div>
                )}
                {/* Overlay en hover cuando ya hay imagen */}
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

// ─── Formulario ───────────────────────────────────────────────────────────────
const UserCreateForm = ({ entityLabel = 'colaborador', onSubmit, isLoading }) => {
    const [form,         setForm]         = useState(EMPTY_FORM)
    const [errors,       setErrors]       = useState({})
    const [avatar,       setAvatar]       = useState({ file: null, preview: null })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm,  setShowConfirm]  = useState(false)

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => ({ ...prev, [key]: null }))
    }

    const handleAvatarChange = (file, preview) => {
        setAvatar({ file, preview })
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim())           e.name           = 'El nombre es requerido.'
        if (!form.lastname.trim())       e.lastname       = 'El apellido es requerido.'
        if (!form.email.trim())          e.email          = 'El correo es requerido.'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido.'
        if (!form.phone.trim())          e.phone          = 'El teléfono es requerido.'
        if (!form.documentNumber.trim()) e.documentNumber = 'El número de documento es requerido.'
        if (!form.password)              e.password       = 'La contraseña es requerida.'
        else if (form.password.length < 8) e.password     = 'Mínimo 8 caracteres.'
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden.'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        onSubmit({
            name:     form.name.trim(),
            lastname: form.lastname.trim(),
            email:    form.email.trim(),
            phone:    { country_code: '+503', number: form.phone.trim() },
            document: { type: form.documentType, number: form.documentNumber.trim() },
            password: form.password,
            avatar:   avatar.file,
        })
        setForm(EMPTY_FORM)
        setErrors({})
        setAvatar({ file: null, preview: null })
    }

    return (
        <FieldSet>

            {/* ── Sección foto ── */}
            <div className='flex justify-center pb-2'>
                <AvatarUpload
                    preview={avatar.preview}
                    onChange={handleAvatarChange}
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
                                placeholder={`Ingrese el nombre del ${entityLabel}`}
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
                                placeholder={`Ingrese el apellido del ${entityLabel}`}
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

            <FieldSeparator />

            {/* ── Sección acceso ── */}
            <FieldGroup>
                <FieldLegend className='text-orve-teal'>Acceso al sistema</FieldLegend>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Contraseña</FieldTitle>
                            <div className='relative'>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setField('password', e.target.value)}
                                    placeholder='Mínimo 8 caracteres'
                                    className='bg-white/70 pr-9'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword((v) => !v)}
                                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-orve-teal/40 hover:text-orve-teal transition-colors'
                                >
                                    {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                </button>
                            </div>
                        </FieldLabel>
                        <FieldError>{errors.password}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel>
                            <FieldTitle className='text-orve-teal/70'>Confirmar contraseña</FieldTitle>
                            <div className='relative'>
                                <Input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.confirmPassword}
                                    onChange={(e) => setField('confirmPassword', e.target.value)}
                                    placeholder='Repita la contraseña'
                                    className='bg-white/70 pr-9'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-orve-teal/40 hover:text-orve-teal transition-colors'
                                >
                                    {showConfirm ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                </button>
                            </div>
                        </FieldLabel>
                        <FieldError>{errors.confirmPassword}</FieldError>
                    </Field>
                </div>
            </FieldGroup>

            {/* ── Acciones ── */}
            <div className='flex justify-end pt-2'>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className='bg-orve-teal hover:bg-orve-darker-teal text-white px-10'
                >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>

        </FieldSet>
    )
}

export default UserCreateForm