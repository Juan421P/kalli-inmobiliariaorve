import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Building2, Calendar, Briefcase, Users, User, Clock, SlidersHorizontal, ChevronDown, Star, Tag, Layers, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import coolAssDesignForTheBackground from '@/assets/cool-ass-design-for-the-background.png'
import orveLogoWhite from '@/assets/orve-logo-white.svg'
const NAV_SECTIONS = [
    {
        label: 'Operaciones',
        items: [
            { icon: Building2, label: 'Propiedades', to: '/properties' },
            { icon: Calendar, label: 'Citas', to: '/appointments' },
            { icon: Briefcase, label: 'Ofertas', to: '/offers' },
        ],
    },
    {
        label: 'Personas',
        items: [
            { icon: Users, label: 'Clientes', to: '/clients' },
            { icon: User, label: 'Colaboradores', to: '/collaborators' },
        ],
    },
    {
        label: 'Sistema',
        items: [
            { icon: Clock, label: 'Horarios disponibles', to: '/schedules' },
            {
                icon: SlidersHorizontal,
                label: 'Catálogos',
                to: '/catalogs',
                submenu: [
                    { icon: Star, label: 'Amenidades', to: '/catalogs/amenities' },
                    { icon: Tag, label: 'Etiquetas', to: '/catalogs/tags' },
                    { icon: Layers, label: 'Características', to: '/catalogs/features' },
                    { icon: Zap, label: 'Electrodomésticos', to: '/catalogs/appliances' },
                ],
            },
        ],
    },
]
const NavItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full',
            active ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white hover:bg-white/10'
        )}
    >
        <Icon className='w-5 h-5 shrink-0' />
        <span className='flex-1'>{label}</span>
    </Link>
)
const SubNavItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={cn(
            'flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-colors w-full',
            active ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/8'
        )}
    >
        <Icon className='w-3.5 h-3.5 shrink-0' />
        <span>{label}</span>
    </Link>
)
const ExpandableNavItem = ({ icon: Icon, label, to, submenu, path }) => {
    const isAnyChildActive = submenu.some((s) => path.startsWith(s.to))
    const [open, setOpen] = useState(isAnyChildActive)
    return (
        <div className='flex flex-col gap-0.5 cursor-pointer'>
            <button
                type='button'
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left',
                    isAnyChildActive ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white hover:bg-white/10'
                )}
            >
                <Icon className='w-5 h-5 shrink-0' />
                <span className='flex-1'>{label}</span>
                <ChevronDown className={cn(
                    'w-3.5 h-3.5 shrink-0 opacity-60 transition-transform duration-200',
                    open && 'rotate-180'
                )} />
            </button>
            <div className={cn(
                'flex flex-col gap-0.5 overflow-hidden transition-all duration-200',
                open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
            )}>
                {submenu.map((item) => (
                    <SubNavItem
                        key={item.to}
                        {...item}
                        active={path.startsWith(item.to)}
                    />
                ))}
            </div>
        </div>
    )
}
const SectionLabel = ({ label }) => (
    <div className='flex items-center gap-2 px-1 mb-1'>
        <span className='text-[10px] font-bold tracking-widest text-white/30 uppercase whitespace-nowrap'>
            {label}
        </span>
        <div className='flex-1 h-px bg-white/15' />
    </div>
)
const Sidebar = ({ userName = 'Abel Joyar', userRole = 'Administrador', userAvatar }) => {
    const location = useLocation()
    const path = location.pathname
    const initials = userName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    return (
        <aside className='w-64 shrink-0 bg-orve-teal flex flex-col py-6 px-4 shadow-xl relative overflow-hidden'>
            <div className='absolute inset-0 opacity-[0.07] bg-cover bg-center pointer-events-none select-none' style={{ backgroundImage: `url(${coolAssDesignForTheBackground})` }} />
            <div className='mb-8 px-1 shrink-0'>
                <img src={orveLogoWhite} alt='ORVE' className='h-8 w-auto pointer-events-none select-none' />
            </div>
            <NavItem icon={Home} label='Inicio' to='/dashboard' active={path === '/dashboard'} />
            <nav className='flex-1 mt-5 flex flex-col gap-5 overflow-y-auto'>
                {NAV_SECTIONS.map(({ label, items }) => (
                    <div key={label} className='flex flex-col gap-0.5'>
                        <SectionLabel label={label} />
                        {items.map((item) =>
                            item.submenu
                                ? <ExpandableNavItem key={item.to} {...item} path={path} />
                                : <NavItem key={item.to} {...item} active={path.startsWith(item.to)} />
                        )}
                    </div>
                ))}
            </nav>
            <div className='mt-4 pt-4 border-t border-white/15 flex items-center gap-3 px-1 shrink-0'>
                <div className='w-9 h-9 rounded-full bg-orve-darker-teal overflow-hidden shrink-0 ring-2 ring-white/20 flex items-center justify-center'>
                    {userAvatar
                        ? <img src={userAvatar} alt={userName} className='w-full h-full object-cover' />
                        : <span className='text-xs font-bold text-white/80 select-none'>{initials}</span>
                    }
                </div>
                <div className='min-w-0'>
                    <p className='text-sm font-semibold text-white truncate select-none'>{userName}</p>
                    <p className='text-xs text-white/45 truncate select-none'>{userRole}</p>
                </div>
            </div>
        </aside>
    )
}
export default Sidebar