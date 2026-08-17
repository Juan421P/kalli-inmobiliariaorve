import dns from 'node:dns';
import mongoose from 'mongoose';
import { config } from './config.js';
// algunos entornos Windows resuelven el DNS de Node a 127.0.0.1 en vez de los
// servidores reales del sistema, lo que rompe la búsqueda SRV de mongodb+srv://
if (config.db.URI.startsWith('mongodb+srv://')) dns.setServers(['8.8.8.8', '8.8.4.4']);
mongoose.connect(config.db.URI);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('db is connected');
});