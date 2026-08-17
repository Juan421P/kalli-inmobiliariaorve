import axios from 'axios';
import { config } from '../../config.js';

const client = axios.create({
    baseURL: 'https://api.brevo.com/v3',
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': config.brevo.apiKey
    }
});

const send = async (to, subject, text, html = null) => {
    return await client.post('/smtp/email', {
        sender: { email: config.brevo.fromEmail, name: config.brevo.fromName },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html ?? undefined
    });
};

const Mail = {
    send,
    async sendHtml(to, subject, text, html) {
        return await send(to, subject, text, html);
    }
};
export default Mail;
