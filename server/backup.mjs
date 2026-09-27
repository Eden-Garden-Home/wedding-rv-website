import { backup, DatabaseSync } from 'node:sqlite';
import { mkdir, readdir, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';

export async function backupDatabase(source, directory, keep = 14) {
  await stat(source);
  await mkdir(directory, { recursive: true });
  const filename = `wedding-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`;
  const destination = join(directory, filename);
  const db = new DatabaseSync(source, { readOnly: true });
  try { await backup(db, destination); }
  finally { db.close(); }
  const names = (await readdir(directory)).filter((name) => /^wedding-.*\.sqlite$/.test(name)).sort().reverse();
  for (const old of names.slice(keep)) await unlink(join(directory, old));
  return destination;
}
