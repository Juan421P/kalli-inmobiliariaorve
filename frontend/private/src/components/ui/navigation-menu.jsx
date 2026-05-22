import * as React from 'react'
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import { cn } from '@/lib/utils'
function NavigationMenu({ className, ...props }) {
	return (
		<NavigationMenuPrimitive.Root className={cn('w-full', className)}{...props} />
	)
}
function NavigationMenuList({ className, ...props }) {
	return (
		<NavigationMenuPrimitive.List className={cn('flex flex-col gap-2 w-full', className)}{...props} />
	)
}
function NavigationMenuItem({ className, ...props }) {
	return (
		<NavigationMenuPrimitive.Item className={cn('w-full', className)}	{...props} />
	)
}
function NavigationMenuLink({ className, active, ...props }) {
	return (
		<NavigationMenuPrimitive.Link className={cn('flex items-center gap-4 rounded-3xl px-6 py-5 transition-all duration-300 text-white/90 hover:bg-white/10', active && 'bg-white/15 shadow-md', className)}{...props} />
	)
}
export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink }