import axios from 'axios';
import { config } from '../../config.js';

const client = axios.create({
    baseURL: 'https://api.mailjet.com/v3.1',
    headers: {
        accept: 'application/json',
        'content-type': 'application/json'
    },
    auth: {
        username: config.mailjet.apiKey,
        password: config.mailjet.apiSecret
    }
});

const send = async (to, subject, text, html = null) => {
    return await client.post('/send', {
        Messages: [
            {
                From: { Email: config.mailjet.fromEmail, Name: config.mailjet.fromName },
                To: [{ Email: to }],
                Subject: subject,
                TextPart: text,
                HTMLPart: html ?? undefined
            }
        ]
    });
};

const Mail = {
    send,
    async sendHtml(to, subject, text, html) {
        return await send(to, subject, text, html);
    }
};
export default Mail;
