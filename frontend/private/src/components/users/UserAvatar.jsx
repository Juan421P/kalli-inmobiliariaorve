import { cn } from '@/lib/utils'

const UserAvatar = ({ name = '', lastname = '', avatarUrl = null, className = '' }) => {
    const initials = `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase()

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={`${name} ${lastname}`}
                className={cn('rounded-full object-cover shrink-0', className)}
            />
        )
    }

    return (
        <div
            className={cn(
                'rounded-full bg-orve-teal/20 text-orve-darker-teal font-semibold flex items-center justify-center shrink-0 select-none',
                className
            )}
        >
            <span className='text-xs'>{initials}</span>
        </div>
    )
}

export default UserAvatar