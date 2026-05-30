import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 12

const CatalogItemGrid = ({ items = [], currentPage, onPageChange }) => {
    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))
    const paginatedItems = items.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const goToPrevPage = () => onPageChange(Math.max(1, currentPage - 1))
    const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))

    return (
        <div className='flex flex-col gap-4'>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5 min-h-32'>
                {paginatedItems.length === 0 ? (
                    <p className='text-sm text-orve-teal/60 col-span-full self-center text-center py-8'>
                        No hay elementos registrados aún.
                    </p>
                ) : (
                    paginatedItems.map((item) => (
                        <span
                            key={item._id}
                            className='flex items-center justify-center text-center px-3 py-2 h-10 rounded-full bg-orve-teal/15 text-orve-darker-teal text-sm font-medium select-none overflow-hidden'
                        >
                            <span className='truncate'>{item.name}</span>
                        </span>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className='flex items-center justify-end gap-1'>
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            currentPage === 1
                                ? 'text-orve-teal/30 cursor-not-allowed'
                                : 'text-orve-teal hover:bg-orve-teal/10'
                        )}
                        aria-label='Página anterior'
                    >
                        <ChevronLeft className='w-4 h-4' />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={cn(
                                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                                page === currentPage
                                    ? 'bg-orve-teal text-white'
                                    : 'text-orve-teal hover:bg-orve-teal/10'
                            )}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            currentPage === totalPages
                                ? 'text-orve-teal/30 cursor-not-allowed'
                                : 'text-orve-teal hover:bg-orve-teal/10'
                        )}
                        aria-label='Página siguiente'
                    >
                        <ChevronRight className='w-4 h-4' />
                    </button>
                </div>
            )}
        </div>
    )
}

export default CatalogItemGrid