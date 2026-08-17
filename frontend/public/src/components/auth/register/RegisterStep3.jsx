import { Controller } from 'react-hook-form'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import OTPInput from '@/components/auth/register/OTPInput'

/**
 * Paso 3 del registro: verificacion de correo electronico con codigo OTP.
 * Muestra 6 cajas divididas en dos grupos de 3 con un separador visual, un
 * countdown del tiempo restante y un enlace para solicitar un nuevo codigo.
 *
 * Usa Controller para OTPInput (input compuesto — no es un input nativo).
 *
 * @param {import('react-hook-form').UseFormReturn} form - step3 del hook
 * @param {string} email - correo al que se envio el OTP (mostrado en la descripcion)
 * @param {number} countdown - segundos restantes del TTL del codigo
 * @param {(s: number) => string} formatCountdown - formatea segundos a "m:ss"
 * @param {Function} onSubmit - handleSubmit ya vinculado por useRegisterForm
 * @param {Function} goBack - retrocede al paso 2
 * @param {string|null} serverError - error del backend (codigo invalido/expirado)
 */
const RegisterStep3 = ({ form, email, countdown, formatCountdown, onSubmit, onResend, goBack, serverError }) => {
    const { control, formState: { isSubmitting, isValid } } = form

    return (
        <form onSubmit={onSubmit} className='flex flex-col gap-4'>
            <p className='text-xs text-orve-teal/70 leading-relaxed'>
                Le hemos enviado un código de 6 dígitos a <span className='font-semibold text-orve-teal'>{email}</span>.
                Revise su bandeja de entrada e introdúzcalo a continuación.
            </p>

            {serverError && (
                <p className='text-xs text-orve-red bg-orve-red/5 border border-orve-red/15 px-3 py-2 rounded-lg text-center'>{serverError}</p>
            )}

            {/* OTP: 3 cajas + separador visual + 3 cajas */}
            <Controller
                name='code'
                control={control}
                rules={{ required: true, validate: (v) => v.length === 6 }}
                render={({ field: { value, onChange } }) => (
                    <OTPInput value={value} onChange={onChange} separatorAt={3} />
                )}
            />

            {/* Countdown + solicitar nuevo codigo */}
            <div className='flex items-center justify-between text-xs'>
                <span className='text-orve-teal/50'>
                    {countdown > 0
                        ? <>El código expira en: <span className='font-semibold text-orve-teal/80'>{formatCountdown(countdown)}</span></>
                        : <span className='text-orve-red/70'>El código ha expirado.</span>
                    }
                </span>
                <button
                    type='button'
                    onClick={onResend}
                    disabled={countdown > 0}
                    className='text-orve-teal underline hover:text-orve-darker-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline'
                >
                    Solicitar un nuevo código
                </button>
            </div>

            {/* Botones Atras / Confirmar correo */}
            <div className='grid grid-cols-2 gap-3'>
                <button
                    type='button'
                    onClick={goBack}
                    className='flex items-center justify-center gap-2 py-3 rounded-xl border border-orve-teal/20 text-orve-teal/70 text-sm font-semibold hover:bg-orve-teal/5 transition-colors'
                >
                    <ArrowLeft className='w-4 h-4' />
                    Atrás
                </button>
                <button
                    type='submit'
                    disabled={isSubmitting || !isValid || countdown === 0}
                    className='flex items-center justify-center gap-2 py-3 rounded-xl bg-orve-darker-teal text-white text-sm font-semibold hover:bg-orve-teal transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                >
                    {isSubmitting
                        ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        : <> Confirmar correo <CheckCircle className='w-4 h-4' /> </>
                    }
                </button>
            </div>

            {/* Indicador de paso */}
            <div className='flex items-center gap-2'>
                <div className='flex-1 h-px bg-orve-teal/10' />
                <span className='text-[10px] text-orve-teal/35 font-medium'>paso 3 / 3</span>
                <div className='flex-1 h-px bg-orve-teal/10' />
            </div>
        </form>
    )
}

export default RegisterStep3
