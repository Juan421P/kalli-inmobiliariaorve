import { cn } from '@/lib/utils'

/**
 * Campo de perfil: muestra valor en modo lectura o input/select en modo edición.
 * @param {string[]} [options] - si se pasa, renderiza un <select> en lugar de <input>
 */
const ProfileField = ({ label, value, editing, onChange, type = 'text', placeholder, options }) => (
    <div className='flex flex-col gap-1.5'>
        <span className='text-xs font-medium text-orve-teal/50 pl-1 select-none'>{label}</span>
        {editing ? (
            options ? (
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={cn(
                        'h-11 px-4 rounded-xl text-sm text-orve-teal font-medium appearance-none cursor-pointer',
                        'bg-orve-teal/10 border border-orve-teal/30',
                        'outline-none focus:border-orve-teal/60 transition-colors'
                    )}
                >
                    <option value='' disabled>{placeholder ?? 'Seleccione una opción'}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    className={cn(
                        'h-11 px-4 rounded-xl text-sm text-orve-teal font-medium',
                        'bg-orve-teal/10 border border-orve-teal/30',
                        'outline-none focus:border-orve-teal/60 transition-colors'
                    )}
                />
            )
        ) : (
            <div className='h-11 px-4 rounded-xl bg-orve-teal/8 flex items-center'>
                <span className='text-sm text-orve-teal/70 font-medium'>
                    {value || <span className='text-orve-teal/30 italic'>—</span>}
                </span>
            </div>
        )}
    </div>
)

export default ProfileField
