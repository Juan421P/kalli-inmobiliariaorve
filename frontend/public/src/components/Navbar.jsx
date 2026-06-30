import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import orveLogo from '@/assets/orve-logo.svg';
import orveLogoWhite from '@/assets/orve-logo-white.svg';
const NavLink = ({ label, to, hasDropdown, transparent }) => (
    <Link
        to={to ?? '#'}
        className={cn(
            'flex items-center gap-0.5 text-sm font-medium transition-colors whitespace-nowrap',
            transparent
                ? 'text-white/90 hover:text-white'
                : 'text-orve-teal/70 hover:text-orve-teal'
        )}
    >
        {label}
        {hasDropdown && <ChevronDown className='w-3.5 h-3.5 opacity-70' />}
    </Link>
);
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
                    <NavLink label='Alquilar' to='/rent' hasDropdown transparent={transparent} />
                    <NavLink label='Comprar' to='/buy' hasDropdown transparent={transparent} />
                    <NavLink label='Propietarios' to='/sell' hasDropdown transparent={transparent} />
                    <NavLink label='Comparar' to='/compare' hasDropdown transparent={transparent} />
                    <NavLink label='Ayuda' to='/help' hasDropdown transparent={transparent} />
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