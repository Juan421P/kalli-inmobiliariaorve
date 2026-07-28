import { z } from 'zod';
import { user, auth, media, database } from './fields/index.js'

export const schemas = {

    queryById: z.object({ id: database.id }).strict(),

    invite: z.object({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        document: user.document,
        phone: user.phone,
        picture: media.picture,
        pictureId: media.pictureId
    }).strict(),

    completeInvitation: z.object({
        token: auth.token,
        code: auth.code,
        password: auth.password,
        confirmPassword: auth.password
    }).strict().refine(
        data => data.password === data.confirmPassword,
        { path: ['confirmPassword'], message: 'passwords do not match' }
    ),

    update: z.object({
        name: user.name.optional(),
        lastname: user.lastname.optional(),
        phone: user.phone.optional(),
        picture: media.picture.optional(),
        pictureId: media.pictureId.optional()
    }).strict(),

    uploadPicture: z.object({
        id: database.id, picture: media.picture, pictureId: media.pictureId
    }).strict(),

    requestRecoveryCode: z.object({ email: user.email }).strict(),

    verifyRecoveryCode: z.object({ token: auth.token, code: auth.code }).strict(),

    changePassword: z.object({
        token: auth.token,
        newPassword: auth.password,
        confirmPassword: auth.password
    }).strict().refine(
        data => data.newPassword === data.confirmPassword,
        { path: ['confirmPassword'], message: 'passwords do not match' }
    )

};