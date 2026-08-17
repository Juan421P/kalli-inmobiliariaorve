// Copia los datos del archivo subido (req.file, provisto por multer/cloudinary) al
// body ANTES de validate_payload, para que los schemas que declaran picture/picture_id
// como campos requeridos los vean a tiempo. Sin esto la validación siempre falla, porque
// el archivo llega en req.file y el controller recién lo copia a req.body después de que
// ya se validó.
export const injectUploadedFile = (req, res, next) => {
    if (req.file) {
        req.body.picture = req.file.path;
        req.body.picture_id = req.file.filename;
    }
    next();
};