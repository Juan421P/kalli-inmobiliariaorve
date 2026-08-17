import { useRef } from 'react'

/**
 * Input de N caracteres para verificación de email con separador visual en el
 * medio (ej: [A][1][B] — [2][C][3]). El foco avanza/retrocede automáticamente
 * y soporta pegar el código completo.
 *
 * @param {string} value - string de hasta BOXES caracteres
 * @param {(v: string) => void} onChange - callback con el nuevo valor completo
 * @param {number} separatorAt - índice ANTES del cual mostrar el separador (default 3)
 */
const OTPInput = ({ value = '', onChange, separatorAt = 3 }) => {
    const BOXES = 6
    const refs = useRef([])
    const digits = value.split('')

    const handleChange = (index, char) => {
        const charValue = char
            .replace(/[^a-zA-Z0-9]/g, '')
            .slice(-1)
            .toLowerCase()

        const next = Array(BOXES)
            .fill('')
            .map((_, i) => (i === index ? charValue : (digits[i] ?? '')))

        onChange(next.join(''))

        // Avanza el foco al siguiente campo
        if (charValue && index < BOXES - 1) {
            refs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        // Si el campo está vacío y presiona Backspace, vuelve al anterior
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            refs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()

        const pasted = e.clipboardData
            .getData('text')
            .replace(/[^a-zA-Z0-9]/g, '')
            .slice(0, BOXES)
            .toLowerCase()

        const result = Array(BOXES)
            .fill('')
            .map((_, i) => pasted[i] ?? '')

        onChange(result.join(''))

        const nextIndex = Math.min(pasted.length, BOXES - 1)
        refs.current[nextIndex]?.focus()
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: BOXES }).map((_, i) => (
                <div key={i} className="flex items-center">
                    {i === separatorAt && (
                        <span className="text-orve-teal/30 text-lg font-light select-none mx-2">
                            —
                        </span>
                    )}

                    <input
                        ref={(el) => {
                            refs.current[i] = el
                        }}
                        type="text"
                        inputMode="text"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digits[i] ?? ''}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        className="w-11 h-12 text-center text-base font-bold border-2 border-orve-teal/20 rounded-xl bg-orve-teal/5 outline-none focus:border-orve-teal transition-colors text-orve-darker-teal"
                    />
                </div>
            ))}
        </div>
    )
}

export default OTPInput