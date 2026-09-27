import { backupDatabase } from './backup.mjs';

const source = process.env.WEDDING_DB_PATH || '/data/wedding.sqlite';
const directory = process.env.WEDDING_BACKUP_DIR || '/backups';
async function run() {
  try { console.log(`Backup creato: ${await backupDatabase(source, directory)}`); }
  catch (error) { console.error('Backup non riuscito:', error); }
}
await run();
setInterval(run, 24 * 60 * 60 * 1000);
