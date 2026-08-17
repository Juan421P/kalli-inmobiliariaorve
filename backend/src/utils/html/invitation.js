// Plantilla del correo de invitación (admin/colaborador). Estilos en línea y sin
// flexbox/grid porque los clientes de correo (Gmail, Outlook, etc.) no soportan CSS
// moderno de forma consistente.
export const invitation = ({ name, link, role }) => `
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #F5F7F7;'>
        <div style='background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8E8;'>
            <div style='background-color: #507177; padding: 28px 32px; text-align: center;'>
                <span style='font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #ffffff;'>ORVE</span>
                <div style='font-size: 12px; color: #C7D6D8; margin-top: 4px;'>Panel de administración · Kalli</div>
            </div>
            <div style='padding: 32px;'>
                <h2 style='color: #2B2B2B; font-size: 20px; margin: 0 0 16px;'>Hola, ${name}</h2>
                <p style='color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;'>
                    Se le ha invitado a unirse al panel de administración de ORVE como <strong>${role}</strong>.
                    Para completar su registro y definir su contraseña, haga clic en el siguiente botón.
                </p>
                <div style='text-align: center; margin: 28px 0;'>
                    <a href='${link}' style='background-color: #507177; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 10px; display: inline-block;'>
                        Completar registro
                    </a>
                </div>
                <p style='color: #888; font-size: 13px; line-height: 1.6; margin: 0 0 8px;'>
                    Este enlace es válido por 15 minutos. Si el botón no funciona, copie y pegue este link en su navegador:
                </p>
                <p style='color: #507177; font-size: 13px; word-break: break-all; margin: 0;'>
                    <a href='${link}' style='color: #507177;'>${link}</a>
                </p>
            </div>
            <div style='background-color: #F5F7F7; padding: 16px 32px; text-align: center; border-top: 1px solid #E2E8E8;'>
                <p style='color: #999; font-size: 12px; margin: 0;'>Si no esperaba este correo, puede ignorarlo con confianza.</p>
            </div>
        </div>
    </div>
`;