import nodemailer from 'nodemailer';
import { config } from '../../config.js';
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.email.user, pass: config.email.password },
    tls: { rejectUnauthorized: false }
});
const send = async (to, subject, text, html = null) => {
    return await transport.sendMail({
        from: config.email.user,
        to,
        subject,
        text,
        html
    });
};
const Mail = {
    transport, send,
    async sendHtml(to, subject, text, html) {
        return await send(to, subject, text, html);
    },
    async verify() {
        return await transport.verify();
    }
};
export default Mail;