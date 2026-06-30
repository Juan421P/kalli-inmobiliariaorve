import { useRef } from 'react';
import { Camera, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import useProfile from '@/hooks/useProfile';
import ProfileField from '@/components/profile/ProfileField';
import SectionHeader from '@/components/profile/SectionHeader';
const Profile = () => {
    const fileInputRef = useRef(null)
    const {
        user,
        tabs, activeTab, setActiveTab,
        personal, setPersonal,
        editingPersonal, setEditingPersonal, savingPersonal, savePersonal,
        identification, setIdentification,
        editingId, setEditingId, savingId, saveId,
    } = useProfile();
    const initials = user ? `${user.name?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase() : '?';
    const setField = (key) => (val) => setPersonal(p => ({ ...p, [key]: val }));
    const setIdField = (key) => (val) => setIdentification(p => ({ ...p, [key]: val }));
    return (
        <div className='min-h-screen'>
            <Navbar />
            <div className='max-w-6xl mx-auto px-6 pt-24 pb-16'>
                <div className='flex items-start gap-8 mb-10'>
                    <div className='flex flex-col items-center gap-3 shrink-0'>
                        <div className='w-28 h-28 rounded-full overflow-hidden bg-orve-teal/15 ring-4 ring-white shadow-md flex items-center justify-center'>
                            {user?.picture
                                ? <img src={user.picture} alt={user.name} className='w-full h-full object-cover' />
                                : <span className='text-3xl font-bold text-orve-teal select-none'>{initials}</span>
                            }
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-orve-teal/10 hover:bg-orve-teal/20 text-orve-teal/70 text-sm font-medium transition-colors cursor-pointer'
                        >
                            <Camera className='w-4 h-4' />
                            Editar foto
                        </button>
                        <input ref={fileInputRef} type='file' accept='image/*' className='hidden' />
                    </div>
                    <div className='pt-2 space-y-2'>
                        <h1 className='text-2xl font-bold text-orve-teal'>
                            {user?.name} {user?.lastname}
                        </h1>
                        {user?.email && (
                            <div className='flex items-center gap-2 text-orve-teal/60 text-sm'>
                                <Mail className='w-4 h-4 shrink-0' />
                                {user.email}
                            </div>
                        )}
                        {user?.phone && (
                            <div className='flex items-center gap-2 text-orve-teal/60 text-sm'>
                                <Phone className='w-4 h-4 shrink-0' />
                                {user.phone}
                            </div>
                        )}
                    </div>
                </div>
                <div className='bg-orve-teal/10 rounded-2xl p-1.5 grid mb-10' style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer',
                                activeTab === tab.key
                                    ? 'bg-orve-darker-teal text-white shadow-sm'
                                    : 'text-orve-teal/50 hover:text-orve-teal'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {activeTab === 'profile' && (
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
                            <div className='grid grid-cols-2 gap-4'>
                                <ProfileField
                                    label='Nombre'
                                    value={personal.name}
                                    editing={editingPersonal}
                                    onChange={setField('name')}
                                />
                                <ProfileField
                                    label='Apellido'
                                    value={personal.lastname}
                                    editing={editingPersonal}
                                    onChange={setField('lastname')}
                                />
                                <ProfileField
                                    label='Correo electrónico'
                                    value={personal.email}
                                    editing={editingPersonal}
                                    onChange={setField('email')}
                                    type='email'
                                />
                                <ProfileField
                                    label='Número de teléfono'
                                    value={personal.phone}
                                    editing={editingPersonal}
                                    onChange={setField('phone')}
                                    type='tel'
                                />
                            </div>
                        </div>
                        <div>
                            <SectionHeader
                                title='Identificación'
                                editing={editingId}
                                onEdit={() => setEditingId(true)}
                                onSave={saveId}
                                onCancel={() => setEditingId(false)}
                                saving={savingId}
                            />
                            <div className='flex flex-col gap-4'>
                                <ProfileField
                                    label='Tipo de documento'
                                    value={identification.document_type}
                                    editing={editingId}
                                    onChange={setIdField('document_type')}
                                    placeholder='Cédula de identidad (DUI)'
                                />
                                <ProfileField
                                    label='Número de documento'
                                    value={identification.document_number}
                                    editing={editingId}
                                    onChange={setIdField('document_number')}
                                    placeholder='00000000-0'
                                />
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'activity' && (
                    <div className='flex flex-col items-center justify-center py-20 text-center gap-3'>
                        <div className='w-16 h-16 rounded-2xl bg-orve-teal/10 flex items-center justify-center mb-2'>
                            <Mail className='w-8 h-8 text-orve-teal/40' />
                        </div>
                        <p className='text-orve-teal/60 font-medium'>Actividad reciente</p>
                        <p className='text-sm text-orve-teal/35'>Aquí aparecerán tus citas y ofertas recientes.</p>
                    </div>
                )}
                {activeTab === 'security' && (
                    <div className='flex flex-col items-center justify-center py-20 text-center gap-3'>
                        <div className='w-16 h-16 rounded-2xl bg-orve-teal/10 flex items-center justify-center mb-2'>
                            <Phone className='w-8 h-8 text-orve-teal/40' />
                        </div>
                        <p className='text-orve-teal/60 font-medium'>Configuración de seguridad</p>
                        <p className='text-sm text-orve-teal/35'>Cambio de contraseña y verificación en dos pasos.</p>
                    </div>
                )}

            </div>
        </div>
    );
};
export default Profile;