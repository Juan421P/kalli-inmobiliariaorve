import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import CatalogItemGrid from '@/components/catalog/CatalogItemGrid'
import CatalogCreateForm from '@/components/catalog/CatalogCreateForm'
import CatalogMergeForm from '@/components/catalog/CatalogMergeForm'
import { Spinner } from '@/components/ui/spinner'
import { panel } from '@/lib/styles'
import toast from '@/lib/toast'
import useAuth from '@/hooks/useAuth'

const CatalogPage = ({ title, subtitle, itemLabel, inputPlaceholder, service }) => {
    const { user } = useAuth()
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true)
            try {
                const data = await service.get()
                // El backend puede retornar { amenities }, { tags }, etc.
                // Buscamos el primer array dentro de la respuesta
                const list = Object.values(data).find(Array.isArray) ?? []
                setItems(list)
            } catch {
                toast.error('Error al cargar', `No se pudieron cargar los ${title.toLowerCase()}.`)
            } finally {
                setIsLoading(false)
            }
        }
        fetchItems()
    }, [service, title])

    const handleCreated = (data) => {
        const newItem = data.item ?? Object.values(data).find((v) => v && typeof v === 'object' && v?._id)
        if (newItem) {
            setItems((prev) => [...prev, newItem])
            setCurrentPage(1)
        }
    }

    const handleMerged = (data) => {
        // Después de mezclar, el backend devuelve los items actualizados
        const updatedList = Object.values(data).find(Array.isArray)
        if (updatedList) setItems(updatedList)
        else {
            // Si no devuelve lista, refrescamos
            service.get().then((res) => {
                const list = Object.values(res).find(Array.isArray) ?? []
                setItems(list)
            })
        }
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
                    <h1 className='text-2xl font-semibold text-orve-teal leading-tight'>{title}</h1>
                    <p className='text-sm text-orve-teal mt-0.5'>{subtitle}</p>
                </header>

                <div className='flex flex-col gap-5'>
                    {/* Sección superior: crear + listado */}
                    <div className='grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5'>
                        {/* Formulario de creación */}
                        <div className={panel}>
                            <h2 className='text-base font-semibold text-orve-teal mb-4'>
                                Crear {`${itemLabel.charAt(0) === 'E' ? 'nuevo' : 'nueva'}`} {itemLabel.toLowerCase()}
                            </h2>
                            <CatalogCreateForm
                                label={itemLabel}
                                placeholder={inputPlaceholder}
                                service={service}
                                onCreated={handleCreated}
                            />
                        </div>

                        {/* Grilla de items */}
                        <div className={panel}>
                            <h2 className='text-base font-semibold text-orve-teal mb-4'>
                                {title} registradas{' '}
                                {!isLoading && (
                                    <span className='font-normal text-orve-teal/60'>
                                        ({items.length})
                                    </span>
                                )}
                            </h2>

                            {isLoading ? (
                                <div className='flex justify-center items-center min-h-32'>
                                    <Spinner className='text-orve-teal' />
                                </div>
                            ) : (
                                <CatalogItemGrid
                                    items={items}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    </div>

                    {/* Sección inferior: mezclar */}
                    <div className={panel}>
                        <h2 className='text-base font-semibold text-orve-teal mb-1'>
                            Mezclar {title.toLowerCase()}
                        </h2>
                        <p className='text-sm text-orve-teal/60 mb-4'>
                            Administre las {title.toLowerCase()} duplicadas o similares agregadas al sistema
                        </p>
                        <CatalogMergeForm
                            label={itemLabel}
                            items={items}
                            service={service}
                            onMerged={handleMerged}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CatalogPage