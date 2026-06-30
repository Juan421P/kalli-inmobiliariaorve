import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
const NavLink = ({ label, to, hasDropdown, transparent }) => (
    <Link
        to={to ?? '#'}
        className={cn(
            'flex items-center gap-0.5 text-sm font-medium transition-colors whitespace-nowrap',
            transparent
                ? 'text-white/90 hover:text-white'
                : 'text-orve-teal/70 hover:text-orve-teal'
        )}
    >
        {label}
        {hasDropdown && <ChevronDown className='w-3.5 h-3.5 opacity-70' />}
    </Link>
);
export default NavLink;