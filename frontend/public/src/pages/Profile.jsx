import { useRef, useState } from 'react'
import { Camera, Mail, Phone } from 'lucide-react' // Phone se usa en el header
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import ClientService from '@/services/Client'
import useAuth from '@/hooks/useAuth'
import useProfile from '@/hooks/useProfile'
import ProfileField from '@/components/profile/ProfileField'
import SectionHeader from '@/components/profile/SectionHeader'
import ProfileActivity from '@/components/profile/ProfileActivity'
import ProfileSecurity from '@/components/profile/ProfileSecurity'

/**
 * Pagina de perfil del cliente autenticado.
 * Tres pestañas: Perfil (datos personales + identificacion), Actividad, Seguridad.
 */
const Profile = () => {
    const { updateUser } = useAuth()
    const fileInputRef = useRef(null)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(null)

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Preview inmediato antes de que responda el servidor
        const localUrl = URL.createObjectURL(file)
        setAvatarUrl(localUrl)
        setUploading(true)

        try {
            const res = await ClientService.uploadPicture(file)
            // Reemplaza el blob local con la URL definitiva de Cloudinary si viene
            const remoteUrl = res?.picture ?? res?.client?.picture ?? res?.url
            if (remoteUrl) {
                setAvatarUrl(remoteUrl)
                updateUser({ picture: remoteUrl })
            }
        } catch {
            // Si falla el upload, revierte al avatar anterior
            setAvatarUrl(null)
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const {
        user,
        tabs, activeTab, setActiveTab,
        isLoading,
        personal, setPersonal,
        editingPersonal, setEditingPersonal, savingPersonal, savePersonal,
        identification,
        personalError,
    } = useProfile()

    const initials = user
        ? `${user.name?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase()
        : '?'

    const setField   = (key) => (val) => setPersonal(p => ({ ...p, [key]: val }))

    return (
        <div className='min-h-screen relative overflow-x-hidden' style={{ background: 'linear-gradient(135deg, #deeef0 0%, #eaf4f5 40%, #f2f8f9 100%)' }}>

            {/* Líneas decorativas de fondo */}
            <svg
                className='absolute inset-0 w-full h-full pointer-events-none'
                preserveAspectRatio='none'
                style={{ opacity: 0.18 }}
                aria-hidden
            >
                <circle cx='72%' cy='18%' r='320' fill='none' stroke='#507177' strokeWidth='60' />
                <circle cx='80%' cy='22%' r='480' fill='none' stroke='#507177' strokeWidth='40' />
                <circle cx='12%' cy='82%' r='260' fill='none' stroke='#507177' strokeWidth='45' />
                <circle cx='5%'  cy='88%' r='400' fill='none' stroke='#507177' strokeWidth='35' />
            </svg>

            <Navbar />

            <div className='relative max-w-5xl mx-auto px-8 pt-28 pb-16'>

                {/* Header: foto + info */}
                <div className='flex items-center gap-7 mb-10'>
                    <div className='shrink-0'>
                        <div className='w-24 h-24 rounded-full overflow-hidden bg-orve-teal/15 ring-4 ring-white shadow-lg flex items-center justify-center relative'>
                            {uploading && (
                                <div className='absolute inset-0 bg-black/30 flex items-center justify-center z-10'>
                                    <span className='w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin' />
                                </div>
                            )}
                            {(avatarUrl || user?.picture)
                                ? <img src={avatarUrl ?? user.picture} alt={user?.name} className='w-full h-full object-cover' />
                                : <span className='text-2xl font-bold text-orve-teal select-none'>{initials}</span>
                            }
                        </div>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        {isLoading ? (
                            <div className='flex flex-col gap-2'>
                                <div className='h-6 w-48 bg-orve-teal/10 rounded-lg animate-pulse' />
                                <div className='h-4 w-36 bg-orve-teal/10 rounded-lg animate-pulse' />
                                <div className='h-4 w-28 bg-orve-teal/10 rounded-lg animate-pulse' />
                            </div>
                        ) : (
                            <>
                                <h1 className='text-2xl font-bold text-orve-darker-teal leading-tight'>
                                    {personal.name} {personal.lastname}
                                </h1>
                                {personal.email && (
                                    <div className='flex items-center gap-2 text-gray-500 text-sm'>
                                        <Mail className='w-3.5 h-3.5 shrink-0' />
                                        {personal.email}
                                    </div>
                                )}
                                {personal.phone && (
                                    <div className='flex items-center gap-2 text-gray-500 text-sm'>
                                        <Phone className='w-3.5 h-3.5 shrink-0' />
                                        +503 {personal.phone}
                                    </div>
                                )}
                            </>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className='mt-1 self-start flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/70 hover:bg-white/90 border border-gray-200/80 text-gray-500 text-xs font-medium transition-colors'
                        >
                            <Camera className='w-3.5 h-3.5' />
                            Editar foto
                        </button>
                        <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handlePhotoChange} />
                    </div>
                </div>

                {/* Tabs */}
                <div
                    className='grid mb-9 rounded-2xl p-1.5'
                    style={{
                        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
                        background: 'rgba(80,113,119,0.10)',
                    }}
                >
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                                activeTab === tab.key
                                    ? 'bg-orve-darker-teal text-white shadow-sm'
                                    : 'text-orve-teal/50 hover:text-orve-teal/80'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Perfil */}
                {activeTab === 'profile' && (
                    isLoading ? (
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
                            {[0, 1].map(i => (
                                <div key={i} className='flex flex-col gap-4'>
                                    <div className='h-5 w-40 bg-orve-teal/10 rounded-lg animate-pulse' />
                                    <div className='grid grid-cols-2 gap-4'>
                                        {[0,1,2,3].map(j => (
                                            <div key={j} className='flex flex-col gap-1.5'>
                                                <div className='h-3 w-16 bg-orve-teal/10 rounded animate-pulse' />
                                                <div className='h-11 rounded-xl bg-orve-teal/8 animate-pulse' />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
                            <div>
                                <SectionHeader
                                    title='Información personal'
                                    editing={editingPersonal}
                                    onEdit={() => setEditingPersonal(true)}
                                    onSave={savePersonal}
                                    onCancel={() => setEditingPersonal(false)}
                                    saving={savingPersonal}
                                />
                                {personalError && (
                                    <p className='mb-3 text-sm text-orve-red'>{personalError}</p>
                                )}
                                <div className='grid grid-cols-2 gap-4'>
                                    <ProfileField label='Nombre'            value={personal.name}     editing={editingPersonal} onChange={setField('name')} />
                                    <ProfileField label='Apellido'          value={personal.lastname} editing={editingPersonal} onChange={setField('lastname')} />
                                    <ProfileField label='Correo electrónico' value={personal.email}   editing={false} type='email' />
                                    <ProfileField label='Número de teléfono' value={personal.phone}   editing={editingPersonal} onChange={setField('phone')} type='tel' />
                                </div>
                            </div>
                            <div>
                                <SectionHeader title='Identificación' />
                                <div className='flex flex-col gap-4'>
                                    <ProfileField
                                        label='Tipo de documento'
                                        value={identification.document_type}
                                        editing={false}
                                        placeholder='Seleccione un tipo'
                                        options={[
                                            { value: 'dui',        label: 'Cédula de identidad (DUI)' },
                                            { value: 'pasaporte',  label: 'Pasaporte' },
                                            { value: 'residencia', label: 'Residencia' },
                                        ]}
                                    />
                                    <ProfileField label='Número de documento' value={identification.document_number} editing={false} placeholder='00000000-0' />
                                </div>
                            </div>
                        </div>
                    )
                )}

                {/* Tab: Actividad */}
                {activeTab === 'activity' && <ProfileActivity />}

                {/* Tab: Seguridad */}
                {activeTab === 'security' && <ProfileSecurity />}
            </div>
        </div>
    )
}

export default Profile