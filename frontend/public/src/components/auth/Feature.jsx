/**
 * Fila de caracteristica para la columna izquierda del AuthLayout.
 * @param {React.ComponentType} icon - icono de lucide-react
 * @param {string} title - titulo de la caracteristica
 * @param {string} subtitle - descripcion corta
 */
const Feature = ({ icon: Icon, title, subtitle }) => (
    <div className='flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3'>
        <div className='w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0'>
            <Icon className='w-4 h-4 text-white' />
        </div>
        <div>
            <p className='text-white text-sm font-semibold'>{title}</p>
            <p className='text-white/60 text-xs'>{subtitle}</p>
        </div>
    </div>
)

export default Feature
