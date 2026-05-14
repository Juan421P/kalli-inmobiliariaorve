import nodemailer from 'nodemailer';
import { config } from '../config.js';
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.email.email, pass: config.email.password }
});
/**
 * Standardized email sender
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text fallback
 * @param {string} [html] - Optional HTML body
 */
export const sendMail = async (to, subject, text, html) => {
    await transport.sendMail({
        from: config.email.email,
        to,
        subject,
        text,
        html
    });
};