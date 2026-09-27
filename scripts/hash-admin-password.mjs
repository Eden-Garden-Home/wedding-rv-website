import { hashPassword } from '../server/password.mjs';

const password = process.env.WEDDING_ADMIN_PASSWORD;
if (!password) throw new Error('Imposta WEDDING_ADMIN_PASSWORD solo per questo comando');
console.log(hashPassword(password));
