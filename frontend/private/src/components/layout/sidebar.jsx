import {
    Home,
    Building2,
    Calendar,
    Briefcase,
    Users,
    Clock,
    SlidersHorizontal
} from 'lucide-react'

import {
    NavigationMenu,
    NavigationMenuList
} from '@/components/ui/navigation-menu'

import SidebarSection from './sidebar-section'
import SidebarItem from './sidebar-item'

import orveLogoWhite from '@/assets/orve-logo-white.svg'

const Sidebar = () => {
    return (
        <aside
            className='
            w-[320px]
            bg-orve-teal/90
            flex flex-col
            py-6 px-4
            shadow-xl
            relative
            '
        >
            <div className='mb-10 px-2'>
                <img
                    src={orveLogoWhite}
                    alt='ORVE'
                    className='h-8'
                />
            </div>

            <NavigationMenu className='w-full'>
                <NavigationMenuList className='space-y-8'>

                    <SidebarSection title='OPERACIONES'>
                        <SidebarItem
                            icon={Home}
                            to='/dashboard'
                            active
                        >
                            Inicio
                        </SidebarItem>

                        <SidebarItem
                            icon={Building2}
                            to='/properties'
                        >
                            Propiedades
                        </SidebarItem>

                        <SidebarItem
                            icon={Calendar}
                            to='/appointments'
                        >
                            Citas
                        </SidebarItem>

                        <SidebarItem
                            icon={Briefcase}
                            to='/offers'
                        >
                            Ofertas
                        </SidebarItem>
                    </SidebarSection>

                    <SidebarSection title='PERSONAS'>
                        <SidebarItem
                            icon={Users}
                            to='/clients'
                        >
                            Clientes
                        </SidebarItem>
                    </SidebarSection>

                    <SidebarSection title='SISTEMA'>
                        <SidebarItem
                            icon={Clock}
                            to='/availability'
                        >
                            Horarios disponibles
                        </SidebarItem>

                        <SidebarItem
                            icon={SlidersHorizontal}
                            to='/catalogs'
                        >
                            Catálogos
                        </SidebarItem>
                    </SidebarSection>

                </NavigationMenuList>
            </NavigationMenu>

            <div
                className='
                mt-auto pt-6
                border-t border-white/20
                flex items-center gap-3
                px-2
                '
            >
                <div
                    className='
                    w-10 h-10 rounded-full
                    overflow-hidden
                    border border-white/20
                    '
                >
                    <img
                        src='https://i.pravatar.cc/150'
                        alt='Profile'
                        className='w-full h-full object-cover'
                    />
                </div>
                <div>
                    <p className='text-sm font-semibold text-white'>

                    </p>
                    <p className='text-xs text-white/60'>

                    </p>
                </div>
            </div>
        </aside>
    )
}
export default Sidebar