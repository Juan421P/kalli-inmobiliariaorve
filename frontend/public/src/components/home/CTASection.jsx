import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Building2, MapPin, Key, ArrowRight, Sparkles, Shield } from 'lucide-react';
const CTASection = () => {
    const navigate = useNavigate();
    return (
        <div className='bg-white/60 backdrop-blur-sm rounded-3xl border border-orve-teal/15 shadow-sm p-8 grid grid-cols-[1fr_auto_1fr] items-center gap-8'>
            <div className='space-y-3'>
                <h3 className='text-2xl font-bold text-orve-teal leading-tight'>¿Quiere alquilar<br />su propiedad?</h3>
                <p className='text-sm text-orve-teal/60 font-medium'>¡Nosotros le asesoramos!</p>
                <div className='pt-2 space-y-2'>
                    <button
                        onClick={() => navigate('/owners/rent')}
                        className='flex items-center gap-1 text-xs text-orve-teal/50 hover:text-orve-teal transition-colors font-medium'
                    >
                        Más información <ArrowRight className='w-3 h-3' />
                    </button>
                    <button
                        onClick={() => navigate('/owners/rent')}
                        className='px-5 py-2 bg-orve-teal hover:bg-orve-darker-teal text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer'
                    >
                        Alquile ya
                    </button>
                </div>
            </div>

            <div className='flex flex-col items-center gap-4 px-4'>
                <div className='flex items-end gap-3'>
                    <div className='w-12 h-12 rounded-2xl bg-orve-teal/10 flex items-center justify-center'>
                        <HomeIcon className='w-6 h-6 text-orve-teal/60' />
                    </div>
                    <div className='w-16 h-16 rounded-2xl bg-orve-teal/20 flex items-center justify-center shadow-sm'>
                        <Building2 className='w-8 h-8 text-orve-teal' />
                    </div>
                    <div className='w-12 h-12 rounded-2xl bg-orve-teal/10 flex items-center justify-center'>
                        <MapPin className='w-6 h-6 text-orve-teal/60' />
                    </div>
                </div>
                <div className='w-24 h-24 rounded-full bg-orve-teal flex items-center justify-center shadow-lg'>
                    <Key className='w-10 h-10 text-white' />
                </div>
                <div className='flex items-start gap-3'>
                    <div className='w-12 h-12 rounded-2xl bg-orve-green/10 flex items-center justify-center'>
                        <Shield className='w-6 h-6 text-orve-green/70' />
                    </div>
                    <div className='w-16 h-16 rounded-2xl bg-orve-teal/20 flex items-center justify-center shadow-sm'>
                        <Sparkles className='w-8 h-8 text-orve-teal' />
                    </div>
                    <div className='w-12 h-12 rounded-2xl bg-orve-green/10 flex items-center justify-center'>
                        <ArrowRight className='w-6 h-6 text-orve-green/70' />
                    </div>
                </div>
            </div>
            <div className='space-y-3 text-right'>
                <h3 className='text-2xl font-bold text-orve-teal leading-tight'>¿Quiere vender<br />su propiedad?</h3>
                <p className='text-sm text-orve-teal/60 font-medium'>¡Nosotros le asesoramos!</p>
                <div className='pt-2 space-y-2 flex flex-col items-end'>
                    <button
                        onClick={() => navigate('/owners/sell')}
                        className='flex items-center gap-1 text-xs text-orve-teal/50 hover:text-orve-teal transition-colors font-medium'
                    >
                        Más información <ArrowRight className='w-3 h-3' />
                    </button>
                    <button
                        onClick={() => navigate('/owners/sell')}
                        className='px-5 py-2 bg-orve-teal hover:bg-orve-darker-teal text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer'
                    >
                        Venda ya
                    </button>
                </div>
            </div>
        </div>
    );
};
export default CTASection;