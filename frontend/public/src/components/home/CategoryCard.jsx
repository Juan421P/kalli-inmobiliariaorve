import { useNavigate } from 'react-router-dom';
const CategoryCard = ({ image, label, to }) => {
    const navigate = useNavigate()
    return (
        <div
            className='relative flex-1 min-h-72 rounded-2xl overflow-hidden cursor-pointer group'
            onClick={() => navigate(to)}
        >
            <img src={image} alt={label} className='absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
            <div className='absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent' />
            <div className='absolute bottom-5 left-5'>
                <button className='px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/40 text-white text-sm font-medium hover:bg-white/30 transition-colors'>
                    {label}
                </button>
            </div>
        </div>
    )
};
export default CategoryCard;