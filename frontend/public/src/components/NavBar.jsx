import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, X, User, LogOut, AlignJustify } from 'lucide-react'
import { cn } from '@/lib/utils'
import orveLogoWhite from '@/assets/orve-logo-white.svg'
import useAuth from '@/hooks/use-auth'

const NAV_ITEMS = [
    {
        label: 'Alquilar',
        children: [
            { label: 'Casas en alquiler', href: '/rent?type=house' },
            { label: 'Apartamentos en alquiler', href: '/rent?type=apartment' },
            { label: 'Terrenos en alquiler', href: '/rent?type=land' },
        ],
    },
    {
        label: 'Comprar',
        children: [
            { label: 'Casas en venta', href: '/buy?type=house' },
            { label: 'Apartamentos en venta', href: '/buy?type=apartment' },
            { label: 'Terrenos en venta', href: '/buy?type=land' },
        ],
    },
    {
        label: 'Propietarios',
        children: [
            { label: 'Alquilar mi propiedad', href: '/owners#rent' },
            { label: 'Vender mi propiedad', href: '/owners#sell' },
        ],
    },
    {
        label: 'Calcular',
        children: [
            { label: 'Calculadora hipotecaria', href: '/calculate#mortgage' },
            { label: 'Estimador de alquiler', href: '/calculate#rent' },
        ],
    },
    {
        label: 'Ayuda',
        children: [
            { label: 'Centro de ayuda', href: '/help' },
            { label: 'Contacto', href: '/help#contact' },
        ],
    },
]

const NavDropdown = ({ label, children, scrolled }) => {
    const [open, setOpen] = useState(false)
    return (
        <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className='relative'>
            <button className={cn(
                'flex items-center gap-1 text-sm font-medium transition-colors py-1',
                scrolled
                    ? 'text-orve-darker-teal hover:text-orve-teal'
                    : 'text-white hover:text-white/80'
            )}>
                {label}
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', open && 'rotate-180')} />
            </button>
            {open && (
                <div className='absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-orve-teal/10 py-1.5 z-50'>
                    {children.map((item) => (
                        <Link key={item.href} to={item.href} className='block px-4 py-2 text-sm text-orve-darker-teal hover:bg-orve-teal/8 transition-colors' onClick={() => setOpen(false)}>
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = () => { logout(); navigate('/') }

    return (
        <header className={cn(
            'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
            scrolled
                ? 'bg-white border-b border-orve-teal/15 shadow-sm'
                : 'bg-gradient-to-b from-black/40 to-transparent border-b border-white/10'
        )}>
            <div className='max-w-7xl mx-auto px-5 h-12 flex items-center justify-between gap-6'>
                <Link to='/' className='shrink-0'>
                    <img src={orveLogoWhite} alt='ORVE' className={cn('h-6 w-auto transition-all duration-300', scrolled && 'brightness-0')} />
                </Link>

                <nav className='hidden md:flex items-center gap-5 flex-1'>
                    {NAV_ITEMS.map((item) => (
                        <NavDropdown key={item.label} label={item.label} children={item.children} scrolled={scrolled} />
                    ))}
                </nav>

                <div className='hidden md:flex items-center gap-2'>
                    <button className={cn(
                        'flex items-center gap-1.5 text-xs border px-2.5 py-1 rounded-lg transition-colors',
                        scrolled
                            ? 'text-orve-darker-teal border-orve-teal/30 hover:border-orve-teal'
                            : 'text-white border-white/30 hover:border-white/60'
                    )}>
                        Español <span className='text-base leading-none'>🌐</span>
                    </button>
                    {isAuthenticated ? (
                        <div className='flex items-center gap-1'>
                            <Link to='/profile' className={cn(
                                'flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                                scrolled
                                    ? 'bg-orve-teal/10 hover:bg-orve-teal/20 text-orve-darker-teal'
                                    : 'bg-white/15 hover:bg-white/25 text-white'
                            )}>
                                <User className='w-3.5 h-3.5' />
                                {user?.name}
                            </Link>
                            <button onClick={handleLogout} className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                scrolled
                                    ? 'text-orve-teal/60 hover:text-orve-teal hover:bg-orve-teal/10'
                                    : 'text-white/60 hover:text-white hover:bg-white/15'
                            )}>
                                <LogOut className='w-4 h-4' />
                            </button>
                        </div>
                    ) : (
                        <div className='flex items-center gap-1'>
                            <button className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                scrolled
                                    ? 'text-orve-teal/80 hover:text-orve-teal hover:bg-orve-teal/10'
                                    : 'text-white/80 hover:text-white hover:bg-white/15'
                            )}>
                                <AlignJustify className='w-4 h-4' />
                            </button>
                            <Link to='/login' className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                scrolled
                                    ? 'text-orve-teal/80 hover:text-orve-teal hover:bg-orve-teal/10'
                                    : 'text-white/80 hover:text-white hover:bg-white/15'
                            )}>
                                <User className='w-4 h-4' />
                            </Link>
                        </div>
                    )}
                </div>

                <button
                    className={cn('md:hidden transition-colors', scrolled ? 'text-orve-teal/80 hover:text-orve-teal' : 'text-white/80 hover:text-white')}
                    onClick={() => setMobileOpen((v) => !v)}
                >
                    {mobileOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
                </button>
            </div>

            {mobileOpen && (
                <div className='md:hidden bg-orve-teal border-t border-white/10 px-4 pb-4 pt-2 flex flex-col gap-1'>
                    {NAV_ITEMS.map((item) => (
                        <div key={item.label}>
                            <p className='text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 py-1 mt-2'>{item.label}</p>
                            {item.children.map((child) => (
                                <Link key={child.href} to={child.href} className='block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors' onClick={() => setMobileOpen(false)}>
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </header>
    )
}

export default Navbar
