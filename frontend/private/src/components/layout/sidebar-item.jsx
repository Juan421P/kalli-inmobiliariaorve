import { Link } from 'react-router-dom'
import {
    NavigationMenuItem,
    NavigationMenuLink
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

const SidebarItem = ({
    icon: Icon,
    children,
    to = '/',
    active = false,
    className
}) => {
    return (
        <NavigationMenuItem>
            <NavigationMenuLink asChild active={active}>
                <Link to={to} className={cn(`flex items-center gap-4 rounded-3xl px-6 py-5 text-white/90 transition-all duration-300 hover:bg-white/10 border border-transparent`, active && `bg-white/15 border-white/10 shadow-md`, className)}>
                    <Icon className='size-7 shrink-0' />
                    <span className='font-medium tracking-wide'>
                        {children}
                    </span>
                </Link>
            </NavigationMenuLink>
        </NavigationMenuItem>
    )
}
export default SidebarItem