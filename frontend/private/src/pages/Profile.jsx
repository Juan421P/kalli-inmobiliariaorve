import { useRef, useState } from 'react'
import { Camera, Mail, Shield } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldLabel, FieldTitle, FieldGroup, FieldSet, FieldLegend } from '@/components/ui/field'
import { panel } from '@/lib/styles'
import useAuth from '@/hooks/useAuth'
import AdminService from '@/services/AdminService'
import { collaboratorsService } from '@/services/CollaboratorsService'
import AuthService from '@/services/AuthService'
import toast from '@/lib/toast'

const Profile = () => {
    const { user, role, login } = useAuth()
    const isAdmin = role === 'admin'
    const service = isAdmin ? AdminService : collaboratorsService

    const [form, setForm] = useState({ name: user?.name ?? '', lastname: user?.lastname ?? '' })
    const [errors, setErrors] = useState({})
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingPicture, setIsUploadingPicture] = useState(false)
    const fileInputRef = useRef(null)

    const initials = `${(user?.name ?? 'U').charAt(0)}${(user?.lastname ?? '').charAt(0)}`.toUpperCase()

    // Refresca el contexto de auth con los datos más recientes tras editar perfil o foto
    const refreshUser = async () => {
        const { role: freshRole, user: freshUser } = await AuthService.me()
        login({ role: freshRole, user: freshUser })
    }

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => ({ ...prev, [key]: null }))
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'El nombre es requerido.'
        if (!form.lastname.trim()) e.lastname = 'El apellido es requerido.'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const hasChanges = form.name.trim() !== (user?.name ?? '') || form.lastname.trim() !== (user?.lastname ?? '')

    const handleSave = async () => {
        if (!validate()) return
        setIsSaving(true)
        try {
            await service.put(user.id, { name: form.name.trim(), lastname: form.lastname.trim() })
            await refreshUser()
            toast.success('Perfil actualizado correctamente.')
        } catch {
            toast.error('Error', 'No se pudo actualizar el perfil.')
        } finally {
            setIsSaving(false)
        }
    }

    const handlePictureChange = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        setIsUploadingPicture(true)
        try {
            await service.uploadPicture(user.id, file)
            await refreshUser()
            toast.success('Foto de perfil actualizada.')
        } catch {
            toast.error('Error', 'No se pudo actualizar la foto de perfil.')
        } finally {
            setIsUploadingPicture(false)
        }
    }

    return (
        <div className='flex h-screen overflow-hidden bg-white/50'>
            <Sidebar />
            <main className='flex-1 overflow-y-auto p-8'>
                <header className='mb-7 select-none'>
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Mi perfil</h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>Administra tu información personal y tu foto de perfil</p>
                </header>

                <div className='flex flex-col gap-6'>

                    {/* Encabezado: avatar + identidad, a todo lo ancho */}
                    <div className={`${panel} flex flex-col sm:flex-row items-center sm:items-stretch gap-8 p-8`}>
                        <div className='relative group shrink-0'>
                            <div className='w-36 h-36 rounded-full bg-orve-teal/15 overflow-hidden flex items-center justify-center ring-4 ring-orve-teal/10'>
                                {user?.picture
                                    ? <img src={user.picture} alt={user.name} className='w-full h-full object-cover' />
                                    : <span className='text-5xl font-bold text-orve-teal select-none'>{initials}</span>
                                }
                            </div>
                            <button
                                type='button'
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingPicture}
                                title='Cambiar foto'
                                className='absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer disabled:opacity-100 disabled:bg-black/40'
                            >
                                {isUploadingPicture ? <Spinner className='size-6' /> : <Camera className='w-8 h-8' />}
                            </button>
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='image/*'
                                className='hidden'
                                onChange={handlePictureChange}
                            />
                        </div>

                        <div className='flex-1 flex flex-col justify-center gap-3 text-center sm:text-left min-w-0'>
                            <div>
                                <p className='text-2xl font-bold text-orve-darker-teal truncate'>
                                    {user?.name} {user?.lastname}
                                </p>
                                <span className='inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-md bg-orve-teal/10 text-orve-teal text-sm font-medium select-none'>
                                    <Shield className='w-3.5 h-3.5' />
                                    {isAdmin ? 'Administrador' : 'Colaborador'}
                                </span>
                            </div>
                            <div className='flex items-center justify-center sm:justify-start gap-2 text-sm text-orve-teal/70 min-w-0 pt-2 border-t border-orve-teal/10'>
                                <Mail className='w-4 h-4 shrink-0' />
                                <span className='truncate'>{user?.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Formulario editable, a todo lo ancho */}
                    <div className={`${panel} p-8`}>
                        <div className='mb-8'>
                            <h2 className='text-lg font-semibold text-orve-teal'>Información personal</h2>
                            <p className='text-sm text-orve-teal/60 mt-0.5'>Estos datos son visibles para el resto del equipo</p>
                        </div>

                        <FieldSet>
                            <FieldGroup>
                                <FieldLegend className='text-orve-teal'>Datos básicos</FieldLegend>

                                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
                                    <Field>
                                        <FieldLabel>
                                            <FieldTitle className='text-orve-teal/70'>Nombre</FieldTitle>
                                            <Input
                                                value={form.name}
                                                onChange={(e) => setField('name', e.target.value)}
                                                placeholder='Tu nombre'
                                                className={`bg-white/70 h-11 ${errors.name ? 'border-orve-red' : ''}`}
                                            />
                                        </FieldLabel>
                                        {errors.name && <p className='text-xs text-orve-red mt-0.5'>{errors.name}</p>}
                                    </Field>

                                    <Field>
                                        <FieldLabel>
                                            <FieldTitle className='text-orve-teal/70'>Apellido</FieldTitle>
                                            <Input
                                                value={form.lastname}
                                                onChange={(e) => setField('lastname', e.target.value)}
                                                placeholder='Tu apellido'
                                                className={`bg-white/70 h-11 ${errors.lastname ? 'border-orve-red' : ''}`}
                                            />
                                        </FieldLabel>
                                        {errors.lastname && <p className='text-xs text-orve-red mt-0.5'>{errors.lastname}</p>}
                                    </Field>

                                    <Field>
                                        <FieldLabel>
                                            <FieldTitle className='text-orve-teal/70'>Correo electrónico</FieldTitle>
                                            <Input value={user?.email ?? ''} disabled className='bg-orve-teal/5 text-orve-teal/50 h-11' />
                                        </FieldLabel>
                                        <p className='text-xs text-orve-teal/40 mt-0.5'>No se puede modificar desde aquí.</p>
                                    </Field>
                                </div>
                            </FieldGroup>
                        </FieldSet>

                        <div className='flex justify-end pt-8'>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className='bg-orve-teal hover:bg-orve-darker-teal text-white px-12 h-11'
                            >
                                {isSaving ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
export default Profile