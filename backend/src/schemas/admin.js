import { z } from 'zod';
import { user, auth, media, database } from './fields/index.js'

export const schemas = {

    queryById: z.object({ id: database.id }).strict(),

    invite: z.object({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        document: user.document,
        phone: user.phone
    }).strict(),

    completeInvitation: z.object({
        token: auth.token,
        code: auth.code,
        password: auth.password,
        confirm_password: auth.password
    }).strict().refine(
        data => data.password === data.confirm_password,
        { path: ['confirm_password'], message: 'passwords do not match' }
    ),

    update: z.object({
        name: user.name.optional(),
        lastname: user.lastname.optional(),
        phone: user.phone.optional()
    }).strict(),

    login: z.object({
        email: user.email,
        password: auth.password
    }).strict(),

    uploadPicture: z.object({}).strict(),

    requestRecoveryCode: z.object({ email: user.email }).strict(),

    verifyRecoveryCode: z.object({ token: auth.token, code: auth.code }).strict(),

    changePassword: z.object({
        token: auth.token,
        new_password: auth.password,
        confirm_password: auth.password
    }).strict().refine(
        data => data.new_password === data.confirm_password,
        { path: ['confirm_password'], message: 'passwords do not match' }
    )

};