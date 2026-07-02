import { useState, useMemo } from 'react'
import { Calculator } from 'lucide-react'
import Navbar from '@/components/Navbar'

/**
 * Calculadora de cuota hipotecaria mensual aproximada.
 * Fórmula estándar de amortización: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * donde P = monto del crédito, r = tasa mensual, n = plazo en meses.
 */
const Calculate = () => {
    const [propertyValue, setPropertyValue] = useState(676767)
    const [creditPct, setCreditPct] = useState(10)
    const [annualRate, setAnnualRate] = useState(6.7)
    const [months, setMonths] = useState(67)
    const [simulated, setSimulated] = useState(true)

    const fmt = (n) =>
        new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)

    const { loanAmount, downPayment, monthly } = useMemo(() => {
        const loan  = propertyValue * (creditPct / 100)
        const down  = propertyValue - loan
        const r     = annualRate / 100 / 12
        const n     = months
        const M     = n === 0 || r === 0
            ? (r === 0 && n > 0 ? loan / n : 0)
            : loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        return { loanAmount: loan, downPayment: down, monthly: M }
    }, [propertyValue, creditPct, annualRate, months])

    const handlePropertyValue = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '')
        setPropertyValue(Number(raw) || 0)
        setSimulated(false)
    }

    return (
        <div
            className='min-h-screen relative overflow-x-hidden'
            style={{ background: 'linear-gradient(135deg, #deeef0 0%, #eaf4f5 40%, #f2f8f9 100%)' }}
        >
            {/* Líneas decorativas */}
            <svg className='absolute inset-0 w-full h-full pointer-events-none' preserveAspectRatio='none' style={{ opacity: 0.15 }} aria-hidden>
                <circle cx='75%' cy='15%' r='300' fill='none' stroke='#507177' strokeWidth='55' />
                <circle cx='82%' cy='20%' r='460' fill='none' stroke='#507177' strokeWidth='38' />
                <circle cx='10%' cy='85%' r='240' fill='none' stroke='#507177' strokeWidth='42' />
            </svg>

            <Navbar />

            <div className='relative max-w-5xl mx-auto px-8 pt-28 pb-16'>
                <h1 className='text-xl font-bold text-orve-darker-teal mb-8'>
                    Calcular cuota mensual aproximada
                </h1>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 items-start'>

                    {/* Panel izquierdo — controles */}
                    <div className='flex flex-col gap-6'>

                        {/* Valor de la propiedad */}
                        <div className='flex flex-col gap-2'>
                            <label className='text-xs text-gray-500 font-medium'>Valor de la propiedad</label>
                            <input
                                type='text'
                                value={`$${fmt(propertyValue)}`}
                                onChange={handlePropertyValue}
                                className='w-full px-4 py-3 text-sm bg-white/80 border border-orve-teal/15 rounded-xl outline-none focus:border-orve-teal/40 text-orve-darker-teal font-medium'
                            />
                        </div>

                        {/* Crédito requerido */}
                        <SliderField
                            label='Crédito requerido'
                            sublabel={`$${fmt(loanAmount)}  ·  ${creditPct}% del valor de la propiedad`}
                            value={creditPct}
                            min={0} max={100} step={1}
                            leftLabel='0%' rightLabel='100%'
                            onChange={(v) => { setCreditPct(v); setSimulated(false) }}
                        />

                        {/* Tasa de interés */}
                        <SliderField
                            label='Tasa de interés'
                            sublabel={`${annualRate}%`}
                            value={annualRate}
                            min={0} max={50} step={0.1}
                            leftLabel='0%' rightLabel='50%'
                            onChange={(v) => { setAnnualRate(v); setSimulated(false) }}
                        />

                        {/* Plazo del crédito */}
                        <SliderField
                            label='Plazo del crédito'
                            sublabel={`${months} meses (${(months / 12).toFixed(2)} años)`}
                            value={months}
                            min={0} max={360} step={1}
                            leftLabel='0 meses' rightLabel='360 meses'
                            onChange={(v) => { setMonths(v); setSimulated(false) }}
                        />

                        <button
                            onClick={() => setSimulated(true)}
                            className='self-start flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orve-darker-teal text-white text-sm font-semibold hover:bg-orve-teal transition-colors'
                        >
                            Simular cálculo
                            <Calculator className='w-4 h-4' />
                        </button>
                    </div>

                    {/* Panel derecho — resultados */}
                    <div className='flex flex-col gap-4'>
                        <ResultCard label='Pago inicial:' value={`$${fmt(downPayment)}`} />
                        <ResultCard label='Pago mensual desde' value={`$${fmt(monthly)}`} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const SliderField = ({ label, sublabel, value, min, max, step, leftLabel, rightLabel, onChange }) => (
    <div className='flex flex-col gap-1.5'>
        <label className='text-xs text-gray-500 font-medium'>{label}</label>
        <p className='text-sm font-bold text-orve-darker-teal'>{sublabel}</p>
        <input
            type='range'
            min={min} max={max} step={step}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className='w-full accent-orve-teal h-1.5 rounded-full cursor-pointer'
        />
        <div className='flex justify-between text-[10px] text-gray-400'>
            <span>{leftLabel}</span>
            <span>{rightLabel}</span>
        </div>
    </div>
)

const ResultCard = ({ label, value }) => (
    <div
        className='rounded-2xl px-8 py-8 flex flex-col gap-2'
        style={{ background: 'linear-gradient(135deg, #507177 0%, #405C62 100%)' }}
    >
        <p className='text-white/70 text-sm'>{label}</p>
        <p className='text-white text-3xl font-bold tracking-tight'>{value}</p>
    </div>
)

export default Calculate
