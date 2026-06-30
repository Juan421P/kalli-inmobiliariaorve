import { cn } from '@/lib/utils';
const ProfileField = ({ label, value, editing, onChange, type = 'text', placeholder }) => (
    <div className='flex flex-col gap-1.5'>
        <span className='text-xs font-medium text-orve-teal/50 pl-1 select-none'>{label}</span>
        {editing
            ? (
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
            : (
                <div className='h-11 px-4 rounded-xl bg-orve-teal/8 flex items-center'>
                    <span className='text-sm text-orve-teal/70 font-medium'>{value || <span className='text-orve-teal/30 italic'>—</span>}</span>
                </div>
            )
        }
    </div>
);
export default ProfileField;