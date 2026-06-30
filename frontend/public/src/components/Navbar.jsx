import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, X, User, LogOut, AlignJustify } from 'lucide-react'
import { cn } from '@/lib/utils'
import orveLogoWhite from '@/assets/orve-logo-white.svg'
import useAuth from '@/hooks/useAuth'

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
            { label: 'Alquilar mi propiedad', href: '/owners/rent' },
            { label: 'Vender mi propiedad', href: '/owners/sell' },
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

const NavDropdown = ({ label, children }) => {
    const [open, setOpen] = useState(false)
    return (
        <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className='relative'>
            <button className='flex items-center gap-1 text-sm font-medium text-white hover:text-white/80 transition-colors py-1'>
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
    const navigate = useNavigate()

    const handleLogout = async () => { await logout(); navigate('/') }

    return (
        <header className='fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-orve-teal/70 border-b border-white/20'>
            <div className='max-w-7xl mx-auto px-8 h-16 flex items-center justify-between gap-10'>
                <Link to='/' className='shrink-0'>
                    <img src={orveLogoWhite} alt='ORVE' className='h-8 w-auto' />
                </Link>

                <nav className='hidden md:flex items-center justify-center gap-7 flex-1'>
                    {NAV_ITEMS.map((item) => (
                        <NavDropdown key={item.label} label={item.label} children={item.children} />
                    ))}
                </nav>

                <div className='hidden md:flex items-center gap-3'>
                    <button className='flex items-center gap-1.5 text-xs text-white border border-white/30 px-2.5 py-1 rounded-lg hover:border-white/60 transition-colors'>
                        Español <span className='text-base leading-none'>🌐</span>
                    </button>
                    {isAuthenticated ? (
                        <div className='flex items-center gap-1'>
                            <Link to='/profile' className='flex items-center gap-2 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-white text-xs font-medium'>
                                <User className='w-3.5 h-3.5' />
                                {user?.name}
                            </Link>
                            <button onClick={handleLogout} className='p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/15 transition-colors'>
                                <LogOut className='w-4 h-4' />
                            </button>
                        </div>
                    ) : (
                        <div className='flex items-center gap-1'>
                            <button className='p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors'>
                                <AlignJustify className='w-4 h-4' />
                            </button>
                            <Link to='/login' className='p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors'>
                                <User className='w-4 h-4' />
                            </Link>
                        </div>
                    )}
                </div>

                <button className='md:hidden text-white/80 hover:text-white' onClick={() => setMobileOpen((v) => !v)}>
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