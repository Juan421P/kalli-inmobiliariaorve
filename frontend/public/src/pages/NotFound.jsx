import { useNavigate } from 'react-router-dom'

const NotFound = () => {
    const navigate = useNavigate()
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e8f0f1 0%, #f5f9fa 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '1rem',
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.5rem',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.18)',
                border: '1px solid rgba(255,255,255,0.6)',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '360px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                textAlign: 'center',
            }}>
                {/* Logo text */}
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#507177', letterSpacing: '0.08em' }}>
                    ORVE
                </span>

                {/* Icon */}
                <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', background: 'rgba(80,113,119,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='rgba(80,113,119,0.55)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                        <path d='M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z'/>
                        <circle cx='12' cy='10' r='3'/>
                    </svg>
                </div>

                {/* Texto */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#507177' }}>
                        Página no encontrada
                    </p>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(80,113,119,0.6)', lineHeight: 1.5 }}>
                        La dirección que buscas no existe o fue movida.
                        ¿Deseas regresar al inicio?
                    </p>
                </div>

                {/* Botón */}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.625rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: '#507177',
                        color: '#fff',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                        <path d='M19 12H5M12 5l-7 7 7 7'/>
                    </svg>
                    Regresar al inicio
                </button>
            </div>
        </div>
    )
}

export default NotFound
