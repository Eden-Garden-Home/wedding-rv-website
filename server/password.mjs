import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12) throw new Error('La password admin deve avere almeno 12 caratteri');
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  const [algorithm, salt, hex] = stored.split(':');
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hex || '')) return false;
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hex, 'hex'));
}

export function tokenHash(token) { return createHash('sha256').update(token).digest('hex'); }
export function newSessionToken() { return randomBytes(32).toString('base64url'); }
