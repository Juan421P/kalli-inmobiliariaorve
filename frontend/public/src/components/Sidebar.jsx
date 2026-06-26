import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, Building2, Calendar, Briefcase, Users, User, Clock, SlidersHorizontal, ChevronDown, Star, Tag, Layers, Zap, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import coolAssDesignForTheBackground from '@/assets/cool-ass-design-for-the-background.png'
import orveLogoWhite from '@/assets/orve-logo-white.svg'
import useAuth from '@/hooks/use-auth'
import AdminService from '@/services/admin'
import CollaboratorService from '@/services/collaborator'
import toast from '@/lib/toast'
const NAV_SECTIONS = [
    {
        label: 'Operaciones',
        roles: ['admin', 'collaborator'],
        items: [
            { icon: Building2, label: 'Propiedades', to: '/properties' },
            { icon: Calendar, label: 'Citas', to: '/appointments' },
            { icon: Briefcase, label: 'Ofertas', to: '/offers' },
        ],
    },
    {
        label: 'Personas',
        roles: ['admin'],
        items: [
            { icon: Users, label: 'Clientes', to: '/clients' },
            { icon: User, label: 'Colaboradores', to: '/collaborators' },
        ],
    },
    {
        label: 'Sistema',
        roles: ['admin'],
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
const navCls = (active) => cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full',
    active ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white hover:bg-white/10'
)
const NavItem = ({ icon: Icon, label, to }) => (
    <NavLink to={to} end={to === '/dashboard'} className={({ isActive }) => navCls(isActive)}>
        <Icon className='w-5 h-5 shrink-0' />
        <span className='flex-1'>{label}</span>
    </NavLink>
)
const SubNavItem = ({ icon: Icon, label, to }) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            'flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-xl text-xs font-medium transition-colors w-full',
            isActive ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/8'
        )}
    >
        <Icon className='w-3.5 h-3.5 shrink-0' />
        <span>{label}</span>
    </NavLink>
)
const ExpandableNavItem = ({ icon: Icon, label, submenu }) => {
    const { pathname } = useLocation()
    const isAnyChildActive = submenu.some((s) => pathname.startsWith(s.to))
    const [open, setOpen] = useState(isAnyChildActive)
    return (
        <div className='flex flex-col gap-0.5'>
            <button
                type='button'
                onClick={() => setOpen((p) => !p)}
                className={navCls(isAnyChildActive)}
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
                    <SubNavItem key={item.to} {...item} />
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
const Sidebar = () => {
    const { user, role, logout } = useAuth()
    console.log(user, role, logout);
    const navigate = useNavigate()
    const initials = (user?.name ?? 'U').split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    const handleLogout = async () => {
        try {
            if (role === 'admin') await AdminService.logout()
            else await CollaboratorService.logout()
        } catch {
        } finally {
            logout()
            toast('Sesión cerrada')
            navigate('/', { replace: true })
        }
    }
    const visibleSections = NAV_SECTIONS.filter((s) => s.roles.includes(role))
    return (
        <aside className='w-64 shrink-0 bg-orve-teal flex flex-col py-6 px-4 shadow-xl relative overflow-hidden'>
            <div
                className='absolute inset-0 opacity-[0.07] bg-cover bg-center pointer-events-none select-none'
                style={{ backgroundImage: `url(${coolAssDesignForTheBackground})` }}
            />
            <div className='mb-8 px-1 shrink-0'>
                <img src={orveLogoWhite} alt='ORVE' className='h-8 w-auto pointer-events-none select-none' />
            </div>
            <NavItem icon={Home} label='Inicio' to='/dashboard' />
            <nav className='flex-1 mt-5 flex flex-col gap-5 overflow-y-auto'>
                {visibleSections.map(({ label, items }) => (
                    <div key={label} className='flex flex-col gap-0.5'>
                        <SectionLabel label={label} />
                        {items.map((item) =>
                            item.submenu
                                ? <ExpandableNavItem key={item.to} {...item} />
                                : <NavItem key={item.to} {...item} />
                        )}
                    </div>
                ))}
            </nav>
            <div className='mt-4 pt-4 border-t border-white/15 flex items-center gap-2 shrink-0'>
                <NavLink
                    to='/profile'
                    className={({ isActive }) => cn(
                        'flex-1 flex items-center gap-3 px-2 py-1.5 rounded-xl transition-colors min-w-0',
                        isActive ? 'bg-white/20' : 'hover:bg-white/10'
                    )}
                >
                    <div className='w-9 h-9 rounded-full bg-orve-darker-teal overflow-hidden shrink-0 ring-2 ring-white/20 flex items-center justify-center'>
                        {user?.avatarUrl
                            ? <img src={user.avatarUrl} alt={user.name} className='w-full h-full object-cover' />
                            : <span className='text-xs font-bold text-white/80 select-none'>{initials}</span>
                        }
                    </div>
                    <div className='min-w-0'>
                        <p className='text-sm font-semibold text-white truncate select-none leading-tight'>
                            {user?.name ?? 'Usuario'}
                        </p>
                        <p className='text-xs text-white/45 truncate select-none'>
                            {role === 'admin' ? 'Administrador' : 'Colaborador'}
                        </p>
                    </div>
                </NavLink>
                <button
                    type='button'
                    onClick={handleLogout}
                    title='Cerrar sesión'
                    className='shrink-0 p-2 rounded-xl text-white/35 hover:text-white hover:bg-white/10 transition-colors cursor-pointer'
                >
                    <LogOut className='w-4 h-4' />
                </button>
            </div>
        </aside>
    )
}
export default Sidebar