import nodemailer from 'nodemailer';
import { config } from '../../config.js';
/**
 * Centralized email service.
 *
 * Provides:
 * - Shared Nodemailer transport
 * - Standardized email sending
 * - Reusable mail helpers
 * - Centralized configuration management
 */
class Mail {
    /**
     * Shared Nodemailer transport instance.
     */
    static transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email.user,
            pass: config.email.password
        }
    });
    /**
     * Sends an email.
     *
     * @param {string|string[]} to - Recipient email or list of emails
     * @param {string} subject - Email subject
     * @param {string} text - Plain text body
     * @param {string|null} [html=null] - Optional HTML body
     *
     * @returns {Object} Nodemailer response
     */
    static async send(to, subject, text, html = null) {
        return await this.transport.sendMail({
            from: config.email.email,
            to,
            subject,
            text,
            html
        });
    }
    /**
     * Sends an HTML-only email.
     *
     * Automatically generates a plain text fallback.
     *
     * @param {string|string[]} to - Recipient email or list of emails
     * @param {string} subject - Email subject
     * @param {string} html - HTML body
     *
     * @returns {Object} Nodemailer response
     */
    static async sendHtml(to, subject, html) {
        return await this.send(to, subject, 'HTML email content', html);
    }
    /**
     * Verifies transporter connection and credentials.
     *
     * Useful during application startup.
     *
     * @returns {boolean} Transport verification result
     */
    static async verify() {
        return await this.transport.verify();
    }
}
export default Mail;