import { useState } from 'react'
import { Search, PlusCircle, Pencil, Building, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { panel } from '@/lib/styles'
import useAuth from '@/hooks/use-auth'
import useProperties from '@/hooks/use-properties'
import PropertiesTable from '@/components/properties/PropertiesTable'
import PropertyCreateForm from '@/components/properties/PropertyCreateForm'
import PropertyEditForm from '@/components/properties/PropertyEditForm'
import UsersPagination from '@/components/users/UsersPagination'

// ─── Tarjeta de métrica ───────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, accent = 'teal' }) => {
    const accents = {
        teal:   { bg: 'bg-orve-teal/10', icon: 'text-orve-teal',   val: 'text-orve-teal'  },
        green:  { bg: 'bg-emerald-50',   icon: 'text-emerald-600', val: 'text-emerald-700' },
        purple: { bg: 'bg-purple-50',    icon: 'text-purple-600',  val: 'text-purple-700'  },
        amber:  { bg: 'bg-amber-50',     icon: 'text-amber-600',   val: 'text-amber-700'   },
    }
    const a = accents[accent] ?? accents.teal
    return (
        <div className={`${panel} flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${a.icon}`} />
            </div>
            <div>
                <p className='text-xs text-orve-teal/60 leading-tight'>{label}</p>
                <p className={`text-2xl font-bold leading-tight ${a.val}`}>{value}</p>
            </div>
        </div>
    )
}

// ─── Selector de filtro compacto ──────────────────────────────────────────────
const FilterSelect = ({ value, onValueChange, placeholder, options }) => (
    <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className='w-36 bg-white/70 h-9 text-sm text-orve-teal border-orve-teal/20'>
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position='popper' className='bg-white border border-input shadow-md'>
            <SelectItem value='all'>{placeholder}</SelectItem>
            {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
        </SelectContent>
    </Select>
)

// ─── Página ───────────────────────────────────────────────────────────────────
const Properties = () => {
    const { user } = useAuth()

    const [tab,             setTab]             = useState('list')
    const [editingProperty, setEditingProperty] = useState(null)

    const {
        properties, metrics, total, totalPages, currentPage, LIMIT,
        search, filterType, filterListing, filterStatus,
        isLoading, isSubmitting,
        setSearch, setFilterType, setFilterListing, setFilterStatus,
        fetchProperties, createProperty, updateProperty, deleteProperty,
    } = useProperties()

    const handleTabChange = (newTab) => {
        if (newTab !== 'update') setEditingProperty(null)
        setTab(newTab)
    }

    const handleCreate = async (formData) => {
        const ok = await createProperty(formData)
        if (ok) setTab('list')
    }

    const handleEdit = (property) => {
        setEditingProperty(property)
        setTab('update')
    }

    const handleUpdate = async (formData) => {
        const ok = await updateProperty(editingProperty._id, formData)
        if (ok) { setEditingProperty(null); setTab('list') }
    }

    return (
        <div className='flex h-screen overflow-hidden bg-white/50'>
            <Sidebar
                userName={user?.name}
                userRole={user?.role === 'admin' ? 'Administrador' : 'Colaborador'}
                userAvatar={user?.avatarUrl}
            />

            <main className='flex-1 overflow-y-auto p-8'>
                <header className='mb-7 select-none'>
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>Propiedades</h1>
                    <p className='text-sm text-orve-teal/70 mt-0.5'>
                        Administre el inventario de propiedades registradas en el sistema
                    </p>
                </header>

                <Tabs value={tab} onValueChange={handleTabChange}>
                    <TabsList className='mb-5 bg-orve-teal/10'>
                        <TabsTrigger value='list'   className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            Propiedades
                        </TabsTrigger>
                        <TabsTrigger value='create' className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                            <PlusCircle className='w-4 h-4' />
                            Nueva propiedad
                        </TabsTrigger>
                        {editingProperty && (
                            <TabsTrigger value='update' className='data-active:bg-white data-active:text-orve-teal text-orve-teal/60'>
                                <Pencil className='w-4 h-4' />
                                Editar propiedad
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* ── Tab lista ── */}
                    <TabsContent value='list'>
                        <div className='flex flex-col gap-5'>

                            {/* Métricas */}
                            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                                <MetricCard icon={Building}     label='Total propiedades' value={metrics.total}     accent='teal'   />
                                <MetricCard icon={CheckCircle2} label='Disponibles'        value={metrics.available} accent='green'  />
                                <MetricCard icon={TrendingUp}   label='Alquiladas'          value={metrics.rented}    accent='purple' />
                                <MetricCard icon={DollarSign}   label='Vendidas'             value={metrics.sold}      accent='amber'  />
                            </div>

                            {/* Tabla */}
                            <div className={panel}>
                                <div className='flex flex-wrap items-center gap-3 mb-5'>
                                    <div className='relative flex-1 min-w-48'>
                                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orve-teal/40' />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder='Buscar por título, dirección o código'
                                            className='pl-9 bg-white/70'
                                        />
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <FilterSelect
                                            value={filterType}
                                            onValueChange={setFilterType}
                                            placeholder='Todo tipo'
                                            options={[
                                                { value: 'house',     label: 'Casa'        },
                                                { value: 'apartment', label: 'Apartamento' },
                                                { value: 'land',      label: 'Terreno'     },
                                            ]}
                                        />
                                        <FilterSelect
                                            value={filterListing}
                                            onValueChange={setFilterListing}
                                            placeholder='Todo listado'
                                            options={[
                                                { value: 'sale', label: 'Venta'    },
                                                { value: 'rent', label: 'Alquiler' },
                                            ]}
                                        />
                                        <FilterSelect
                                            value={filterStatus}
                                            onValueChange={setFilterStatus}
                                            placeholder='Todo estado'
                                            options={[
                                                { value: 'available', label: 'Disponible' },
                                                { value: 'occupied',  label: 'Ocupado'    },
                                            ]}
                                        />
                                    </div>
                                </div>

                                <PropertiesTable
                                    properties={properties}
                                    isLoading={isLoading}
                                    onEdit={handleEdit}
                                    onDelete={deleteProperty}
                                />

                                {!isLoading && (
                                    <UsersPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        total={total}
                                        limit={LIMIT}
                                        entityLabel='propiedades'
                                        onPageChange={(page) => fetchProperties(page, search, filterType, filterListing, filterStatus)}
                                    />
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── Tab crear ── */}
                    <TabsContent value='create'>
                        <div className={panel}>
                            <div className='mb-6'>
                                <h2 className='text-base font-semibold text-orve-teal'>Información de la propiedad</h2>
                                <p className='text-sm text-orve-teal/60 mt-0.5'>
                                    Complete los campos para registrar una nueva propiedad en el sistema
                                </p>
                            </div>
                            <PropertyCreateForm
                                onSubmit={handleCreate}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </TabsContent>

                    {/* ── Tab actualizar ── */}
                    <TabsContent value='update'>
                        {editingProperty && (
                            <div className={panel}>
                                <div className='mb-6'>
                                    <h2 className='text-base font-semibold text-orve-teal'>Editar propiedad</h2>
                                    <p className='text-sm text-orve-teal/60 mt-0.5'>
                                        Modificando: <span className='font-medium text-orve-teal'>{editingProperty.title}</span>
                                    </p>
                                </div>
                                <PropertyEditForm
                                    initialData={editingProperty}
                                    onSubmit={handleUpdate}
                                    onCancel={() => { setTab('list'); setEditingProperty(null) }}
                                    isLoading={isSubmitting}
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

export default Properties
