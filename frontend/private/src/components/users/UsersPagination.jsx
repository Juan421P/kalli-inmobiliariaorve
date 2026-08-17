import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const UsersPagination = ({ currentPage, totalPages, total, limit, entityLabel = 'registros', onPageChange }) => {
    const from  = total === 0 ? 0 : (currentPage - 1) * limit + 1
    const to    = Math.min(currentPage * limit, total)

    const goTo  = (page) => {
        if (page < 1 || page > totalPages) return
        onPageChange(page)
    }

    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        if (totalPages <= 5) return i + 1
        if (currentPage <= 3) return i + 1
        if (currentPage >= totalPages - 2) return totalPages - 4 + i
        return currentPage - 2 + i
    })

    return (
        <div className='flex items-center justify-between pt-3 border-t border-orve-teal/10'>
            <span className='text-sm text-orve-teal/60'>
                {total === 0
                    ? `Sin ${entityLabel}`
                    : `Mostrando ${from} a ${to} de ${total} ${entityLabel}`}
            </span>

            {totalPages > 1 && (
                <div className='flex items-center gap-1'>
                    <button
                        onClick={() => goTo(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            currentPage === 1
                                ? 'text-orve-teal/20 cursor-not-allowed'
                                : 'text-orve-teal hover:bg-orve-teal/10'
                        )}
                    >
                        <ChevronLeft className='w-4 h-4' />
                    </button>

                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => goTo(page)}
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
                        onClick={() => goTo(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            currentPage === totalPages
                                ? 'text-orve-teal/20 cursor-not-allowed'
                                : 'text-orve-teal hover:bg-orve-teal/10'
                        )}
                    >
                        <ChevronRight className='w-4 h-4' />
                    </button>
                </div>
            )}
        </div>
    )
}

export default UsersPagination