import { useRef } from 'react'

/**
 * Input de N digitos para verificacion de email con separador visual en el
 * medio (ej: [6][7][6] — [7][6][7]). El foco avanza/retrocede automaticamente
 * y se soporta paste del codigo completo.
 *
 * @param {string} value - string de hasta BOXES digitos
 * @param {(v: string) => void} onChange - callback con el nuevo valor completo
 * @param {number} separatorAt - indice ANTES del cual mostrar el separador (default 3)
 */
const OTPInput = ({ value = '', onChange, separatorAt = 3 }) => {
    const BOXES = 6
    const refs = useRef([])
    const digits = value.split('')

    const handleChange = (index, char) => {
        const digit = char.replace(/\D/g, '').slice(-1)
        const next = Array(BOXES).fill('').map((_, i) => (i === index ? digit : (digits[i] ?? '')))
        onChange(next.join(''))
        // Avanza el foco al siguiente campo al escribir un digito
        if (digit && index < BOXES - 1) refs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index, e) => {
        // Retrocede el foco al borrar un campo ya vacio
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            refs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, BOXES)
        const result = Array(BOXES).fill('').map((_, i) => pasted[i] ?? '')
        onChange(result.join(''))
        refs.current[Math.min(pasted.length, BOXES - 1)]?.focus()
    }

    return (
        <div className='flex items-center justify-center gap-2'>
            {Array(BOXES).fill(null).map((_, i) => (
                <>
                    {/* Separador visual entre el tercer y cuarto digito */}
                    {i === separatorAt && (
                        <span key={`sep-${i}`} className='text-orve-teal/30 text-lg font-light select-none mx-0.5'>—</span>
                    )}
                    <input
                        key={i}
                        ref={(el) => { refs.current[i] = el }}
                        type='text'
                        inputMode='numeric'
                        maxLength={1}
                        value={digits[i] ?? ''}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        className='w-11 h-12 text-center text-base font-bold border-2 border-orve-teal/20 rounded-xl bg-orve-teal/5 outline-none focus:border-orve-teal transition-colors text-orve-darker-teal'
                    />
                </>
            ))}
        </div>
    )
}

export default OTPInput
