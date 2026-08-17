import { SquarePen, Check, X } from 'lucide-react';
const SectionHeader = ({ title, editing, onEdit, onSave, onCancel, saving }) => (
    <div className='flex items-center gap-3 mb-5'>
        <h2 className='text-xl font-bold text-orve-teal'>{title}</h2>
        {editing
            ? (
                <div className='flex items-center gap-1.5'>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className='w-8 h-8 rounded-xl bg-orve-green/15 hover:bg-orve-green/25 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50'
                    >
                        <Check className='w-4 h-4 text-orve-green' />
                    </button>
                    <button
                        onClick={onCancel}
                        className='w-8 h-8 rounded-xl bg-orve-red/10 hover:bg-orve-red/20 flex items-center justify-center transition-colors cursor-pointer'
                    >
                        <X className='w-4 h-4 text-orve-red' />
                    </button>
                </div>
            )
            : onEdit && (
                <button
                    onClick={onEdit}
                    className='w-8 h-8 rounded-xl bg-orve-teal/10 hover:bg-orve-teal/20 flex items-center justify-center transition-colors cursor-pointer'
                >
                    <SquarePen className='w-4 h-4 text-orve-teal/60' />
                </button>
            )
        }
    </div>
);
export default SectionHeader;