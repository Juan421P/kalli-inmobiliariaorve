import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Building2, Calendar, Briefcase, Users, User, Clock, SlidersHorizontal, TrendingUp, TrendingDown } from 'lucide-react'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu'
import orveLogoWhite from '@/assets/orve-logo-white.svg'
import horseImg from '@/assets/horse.png'
const MetricCard = ({ icon: Icon, title, value, trend, trendUp }) => (
    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-2 text-slate-500">
            <div className="p-2 bg-slate-200/50 rounded-lg">
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-end gap-3 mt-2">
            <span className="text-4xl font-light text-slate-700">{value}</span>
            {trend && (
                <span className={`text-xs font-medium mb-1 flex items-center gap-1 ${trendUp ? 'text-orve-green' : 'text-orve-red'}`}>
                    {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend} desde ayer
                </span>
            )}
        </div>
    </div>
)
const Dashboard = () => {
    return (
        <div className="flex h-screen overflow-hidden font-sans">
            <aside className="w-64 bg-orve-teal/90 flex flex-col py-6 px-4 shadow-xl z-10 relative">
                <div className="mb-8 px-2">
                    <img src={orveLogoWhite} alt="ORVE" className="h-8 mb-8" />
                </div>
                <NavigationMenu className='w-full'>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink active>
                                <Home className='size-7' />
                                <span>Inicio</span>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink>
                                <Building2 className='size-7' />
                                <span>Propiedades</span>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="mt-auto pt-4 border-t border-white/20 flex items-center gap-3 px-2 select-none">
                    <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden border border-white/40 shadow-sm">
                        <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white tracking-wide">Abel Joyar</p>
                        <p className="text-xs text-white/70 font-medium">Administrador</p>
                    </div>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 select-none">
                    <h1 className="text-2xl font-semibold text-slate-700">Inicio</h1>
                    <p className="text-sm text-slate-500">Resumen general de la actividad del sistema</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard icon={Calendar} title="Citas pendientes" value="12" trend="+ 3" trendUp={true} />
                    <MetricCard icon={Briefcase} title="Ofertas pendientes" value="3" trend="- 1" trendUp={false} />
                    <MetricCard icon={Home} title="Propiedades activas" value="167" />
                    <MetricCard icon={Users} title="Clientes registrados" value="267" trend="+ 6" trendUp={true} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-12rem)] min-h-100">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white shadow-sm overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 mb-4 text-slate-700 font-medium select-none">
                                <Calendar className="w-5 h-5" /> Citas recientes
                            </div>
                            <div className="flex-1 bg-slate-100/50 rounded-lg flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300">
                                Componente de Tabla (Citas)
                            </div>
                        </div>
                        <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white shadow-sm overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 mb-4 text-slate-700 font-medium select-none">
                                <Briefcase className="w-5 h-5" /> Ofertas recientes
                            </div>
                            <div className="flex-1 bg-slate-100/50 rounded-lg flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-300">
                                Componente de Tabla (Ofertas)
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 rounded-2xl overflow-hidden shadow-md border border-white bg-white/50 relative min-h-75">
                        <img src={horseImg} alt="Featured Real Estate Visual Asset" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                </div>
            </main>
        </div>
    )
}
export default Dashboard