export const registration = (code) => `
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
        <h2 style='color: #333; text-align: center;'>Confirmación de correo</h2>
        <p style='color: #555; font-size: 16px;'>Dispone usted de 15 minutos para activar su cuenta con este código</p>
        <div style='background-color: #f4f4f4; padding: 15px; margin: 20px 0; text-align: center; border-radius: 5px;'>
            <span style='font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #000;'>${code}</span>
        </div>
        <p style='color: #999; font-size: 12px; text-align: center;'>Si no solicitó esto, ignore este correo</p>
    </div>
`;