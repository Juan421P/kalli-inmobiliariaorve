import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import useHome from '@/hooks/useHome';
import CategoryCard from '@/components/home/CategoryCard';
import CTASection from '@/components/home/CTASection';
import PropertyCard from '@/components/home/PropertyCard';
import beautifulBackgroundForTheHomePage from '@/assets/beautiful-background-for-the-home-page.png';
const Home = () => {
    const navigate = useNavigate();
    const {
        tabs, activeTab, setActiveTab,
        properties, loading,
        carouselIdx, CARD_W, progress,
        canPrev, canNext, prev, next, seekTo,
        search, setSearch,
    } = useHome();
    return (
        <div className='min-h-screen'>
            <Navbar />
            <section className='relative h-[62vh] min-h-110 flex flex-col justify-end pb-12 overflow-hidden'>
                <img
                    src={beautifulBackgroundForTheHomePage}
                    alt=''
                    className='absolute top-1/2 left-1/2 scale-110 -translate-x-1/2 -translate-y-1/2 object-cover'
                />
                <div className='absolute inset-0 bg-linear-to-b from-black/20 via-black/10 to-black/40' />
                <div className='relative z-10 max-w-6xl mx-auto px-6 w-full'>
                    <h1 className='text-4xl md:text-5xl font-bold text-white leading-tight mb-7 max-w-lg drop-shadow-sm'>
                        A un clic de tu<br />próximo hogar
                    </h1>
                    <div className='flex items-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden max-w-lg'>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && navigate(`/search?q=${search}`)}
                            placeholder='Buscar por ciudad, zona, colonia o lugar'
                            className='flex-1 px-5 py-3.5 text-sm text-orve-teal/80 placeholder:text-orve-teal/40 bg-transparent outline-none'
                        />
                        <button
                            onClick={() => navigate(`/search?q=${search}`)}
                            className='m-1.5 w-10 h-10 rounded-xl bg-orve-teal hover:bg-orve-darker-teal flex items-center justify-center transition-colors cursor-pointer shrink-0'
                        >
                            <Search className='w-4 h-4 text-white' />
                        </button>
                    </div>
                </div>
            </section>
            <section className='max-w-6xl mx-auto px-6 py-10'>
                <div className='flex items-center gap-1 mb-7 bg-orve-teal/10 rounded-2xl p-1 w-fit'>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                                activeTab === tab.key
                                    ? 'bg-orve-teal text-white shadow-sm'
                                    : 'text-orve-teal/60 hover:text-orve-teal'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className='overflow-hidden'>
                    {loading
                        ? (
                            <div className='flex gap-4'>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className='w-64 h-80 rounded-2xl bg-orve-teal/10 animate-pulse shrink-0' />
                                ))}
                            </div>
                        )
                        : (
                            <div
                                className='flex gap-4 transition-transform duration-400 ease-out'
                                style={{ transform: `translateX(-${carouselIdx * CARD_W}px)` }}
                            >
                                {properties.map(p => <PropertyCard key={p._id} property={p} />)}
                            </div>
                        )
                    }
                </div>
                {!loading && properties.length > 0 && (
                    <div className='mt-5 flex items-center gap-4'>
                        <div
                            className='flex-1 h-1.5 bg-orve-teal/15 rounded-full cursor-pointer'
                            onClick={e => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                seekTo((e.clientX - rect.left) / rect.width)
                            }}
                        >
                            <div
                                className='h-full bg-orve-teal rounded-full transition-all duration-300'
                                style={{ width: `${Math.max(8, progress * 100)}%` }}
                            />
                        </div>
                        <div className='flex gap-2 shrink-0'>
                            <button
                                onClick={prev}
                                disabled={!canPrev}
                                className='w-8 h-8 rounded-full border border-orve-teal/25 flex items-center justify-center text-orve-teal/60 hover:bg-orve-teal/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer'
                            >
                                <ChevronLeft className='w-4 h-4' />
                            </button>
                            <button
                                onClick={next}
                                disabled={!canNext}
                                className='w-8 h-8 rounded-full border border-orve-teal/25 flex items-center justify-center text-orve-teal/60 hover:bg-orve-teal/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer'
                            >
                                <ChevronRight className='w-4 h-4' />
                            </button>
                        </div>
                    </div>
                )}
            </section>
            <section className='max-w-6xl mx-auto px-6 pb-10 flex gap-4'>
                <CategoryCard
                    image='https://picsum.photos/seed/houses/600/400'
                    label='Explorar viviendas'
                    to='/search?type=house'
                />
                <CategoryCard
                    image='https://picsum.photos/seed/apartments/600/400'
                    label='Explorar apartamentos'
                    to='/search?type=apartment'
                />
                <CategoryCard
                    image='https://picsum.photos/seed/terrain/600/400'
                    label='Explorar terrenos'
                    to='/search?type=land'
                />
            </section>
            <section className='max-w-6xl mx-auto px-6 pb-14'>
                <CTASection />
            </section>
        </div>
    )
}
export default Home