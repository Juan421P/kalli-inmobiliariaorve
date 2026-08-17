export const propertyCreated = (property, url) => `
    <div>
        <h1>Su propiedad ya se encuentra publicada</h1>
        <p>Su propiedad "${property.title}" ha sido publicada por nuestro equipo.</p>
        <p>Puede consultarla en el vínculo a continuación:</p>
        <a href="${url}">Ver propiedad</a>
        <br />
        <br />
        <p>Si identifica información incorrectao tiene alguna pregunta con relacióna la publicación de su propiedad,por favor contáctenos.</p>
    </div>
`;