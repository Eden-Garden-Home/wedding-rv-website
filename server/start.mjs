import { openDatabase } from './database.mjs';
import { createHttpServer } from './http.mjs';
import { hashPassword } from './password.mjs';

const production = process.env.NODE_ENV === 'production';
const adminPasswordHash = process.env.WEDDING_ADMIN_PASSWORD_HASH ||
  (!production && process.env.WEDDING_ADMIN_PASSWORD ? hashPassword(process.env.WEDDING_ADMIN_PASSWORD) : '');
if (!adminPasswordHash) throw new Error('WEDDING_ADMIN_PASSWORD_HASH è obbligatoria');
const db = openDatabase();
const server = createHttpServer({
  db,
  adminPasswordHash,
  production,
  publicBaseUrl: process.env.WEDDING_PUBLIC_URL || 'https://valentinaericcardo.world',
  adminOrigin: process.env.WEDDING_ADMIN_ORIGIN || 'https://admin.valentinaericcardo.world',
});
const port = Number(process.env.PORT || 8787);
server.listen(port, '0.0.0.0', () => console.log(`Wedding API in ascolto sulla porta ${port}`));
const shutdown = () => server.close(() => { db.close(); process.exit(0); });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
