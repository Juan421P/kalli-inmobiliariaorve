import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import orveLogo from '@/assets/orve-logo.svg';
import orveLogoWhite from '@/assets/orve-logo-white.svg';

// Cada entrada con `items` despliega un dropdown; sin `items` es un link directo.
const NAV_ITEMS = [
    {
        label: 'Alquilar',
        to: '/rent',
        items: [
            { label: 'Casas', to: '/rent?type=house' },
            { label: 'Apartamentos', to: '/rent?type=apartment' },
        ],
    },
    {
        label: 'Comprar',
        to: '/buy',
        items: [
            { label: 'Casas', to: '/buy?type=house' },
            { label: 'Apartamentos', to: '/buy?type=apartment' },
            { label: 'Terrenos', to: '/buy?type=land' },
        ],
    },
    {
        label: 'Propietarios',
        items: [
            { label: 'Alquilar mi propiedad', to: '/owners/rent' },
            { label: 'Vender mi propiedad', to: '/owners/sell' },
        ],
    },
    {
        label: 'Calcular',
        items: [
            { label: 'Calcular cuota mensual', to: '/calculate' },
            { label: 'Comparar propiedades',   to: '/compare' },
        ],
    },
    { label: 'Ayuda', to: '/help' },
];

const NavLink = ({ item, transparent }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Cierra el dropdown al clickear afuera.
    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    const hasDropdown = Boolean(item.items?.length);
    const textClass = transparent
        ? 'text-white/90 hover:text-white'
        : 'text-orve-teal/70 hover:text-orve-teal';

    if (!hasDropdown) {
        return (
            <Link to={item.to} className={cn('text-sm font-medium transition-colors whitespace-nowrap', textClass)}>
                {item.label}
            </Link>
        );
    }

    return (
        <div ref={ref} className='relative'>
            <button
                onClick={() => setOpen((v) => !v)}
                className={cn('flex items-center gap-0.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer', textClass)}
            >
                {item.label}
                <ChevronDown className={cn('w-3.5 h-3.5 opacity-70 transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
                <div className='absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-orve-teal/10 py-1.5 z-50'>
                    {item.items.map((sub) => (
                        <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setOpen(false)}
                            className='block px-4 py-2 text-sm text-orve-teal/70 hover:bg-orve-teal/5 hover:text-orve-teal transition-colors'
                        >
                            {sub.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const Navbar = () => {
    const { pathname } = useLocation()
    const { isAuthenticated, user } = useAuth()
    const navigate = useNavigate()
    const isHome = pathname === '/' || pathname === '/home'
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        if (!isHome) return
        const onScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [isHome])
    const transparent = isHome && !scrolled
    const initials = user?.name
        ? `${user.name[0]}${user.lastname?.[0] ?? ''}`.toUpperCase()
        : null
    return (
        <nav className={cn(
            'fixed top-0 inset-x-0 z-50 transition-all duration-300',
            transparent
                ? 'bg-transparent'
                : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-orve-teal/10'
        )}>
            <div className='max-w-6xl mx-auto px-6 h-16 flex items-center gap-8'>
                <Link to='/' className='shrink-0'>
                    <img
                        src={transparent ? orveLogoWhite : orveLogo}
                        alt='ORVE'
                        className='h-8 w-auto'
                    />
                </Link>
                <div className='flex-1 hidden md:flex items-center justify-center gap-7'>
                    {NAV_ITEMS.map((item) => (
                        <NavLink key={item.label} item={item} transparent={transparent} />
                    ))}
                </div>
                <div className='flex items-center gap-3 ml-auto'>
                    <button className={cn(
                        'hidden md:flex items-center gap-1 text-sm font-medium transition-colors',
                        transparent ? 'text-white/80 hover:text-white' : 'text-orve-teal/60 hover:text-orve-teal'
                    )}>
                        <Globe className='w-4 h-4' />
                        Español
                        <ChevronDown className='w-3.5 h-3.5 opacity-70' />
                    </button>
                    <div className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-1.5 cursor-pointer transition-colors',
                        transparent
                            ? 'border border-white/40 hover:bg-white/10'
                            : 'border border-orve-teal/25 hover:bg-orve-teal/5'
                    )}
                        onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                    >
                        <Menu className={cn('w-5 h-5', transparent ? 'text-white' : 'text-orve-teal/70')} />
                        <div className={cn(
                            'w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0',
                            transparent ? 'bg-white/20' : 'bg-orve-teal/15'
                        )}>
                            {user?.picture
                                ? <img src={user.picture} alt={user.name} className='w-full h-full object-cover' />
                                : initials
                                    ? <span className={cn('text-xs font-bold', transparent ? 'text-white' : 'text-orve-teal')}>{initials}</span>
                                    : <User className={cn('w-4 h-4', transparent ? 'text-white/80' : 'text-orve-teal/60')} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;