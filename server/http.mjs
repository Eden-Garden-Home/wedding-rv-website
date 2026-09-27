import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { AppError, addGuest, applyImport, createHousehold, dashboard, exportCsv, getInvitation, listEvents, listHouseholds, logEvent, previewImport, rotateCode, saveRsvp, updateGuest, updateHousehold } from './core.mjs';
import { newSessionToken, tokenHash, verifyPassword } from './password.mjs';

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const cookieName = (production) => production ? '__Host-wedding_admin' : 'wedding_admin_dev';

function json(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(JSON.stringify(data));
}

async function body(req, limit = 2_500_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new AppError(413, 'Richiesta troppo grande');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AppError(400, 'JSON non valido'); }
}

function routeMatch(path, expression) { return path.match(expression); }

function getCookie(req, name) {
  const pair = (req.headers.cookie || '').split(';').map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name}=`));
  return pair?.slice(name.length + 1) || '';
}

function rateLimiter() {
  const counts = new Map();
  return (req, group, max) => {
    const ip = String(req.headers['cf-connecting-ip'] || req.socket.remoteAddress || 'unknown').slice(0, 100);
    const slot = Math.floor(Date.now() / 60_000);
    const key = `${ip}:${group}:${slot}`;
    const next = (counts.get(key) || 0) + 1;
    counts.set(key, next);
    if (counts.size > 10_000) for (const item of counts.keys()) if (!item.endsWith(`:${slot}`)) counts.delete(item);
    if (next > max) throw new AppError(429, 'Troppe richieste. Riprova tra poco.');
  };
}

async function serveAdminStatic(path, res, root) {
  const asset = path === '/admin' || path === '/admin/' ? 'index.html' : path.replace(/^\/admin\/?/, '');
  const file = resolve(root, asset);
  if (file !== root && !file.startsWith(root + sep)) throw new AppError(404, 'Pagina non trovata');
  try {
    if (!(await stat(file)).isFile()) throw new Error('not a file');
    const contents = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    res.end(contents);
  } catch { throw new AppError(404, 'Pagina admin non compilata'); }
}

export function createHttpServer({ db, adminPasswordHash, publicBaseUrl = 'https://valentinaericcardo.world', adminOrigin = 'https://admin.valentinaericcardo.world', production = false, adminDist = resolve('dist/admin') }) {
  const limit = rateLimiter();
  const adminCookie = cookieName(production);
  const developmentOrigins = ['http://127.0.0.1:8787', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];
  return createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    const path = url.pathname;
    const origin = req.headers.origin;
    const allowedOrigins = new Set(production
      ? [path.startsWith('/api/admin/') ? adminOrigin : new URL(publicBaseUrl).origin]
      : [adminOrigin, ...developmentOrigins]);
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS');
      res.setHeader('Vary', 'Origin');
    }
    try {
      if (req.method === 'OPTIONS') { res.writeHead(origin && allowedOrigins.has(origin) ? 204 : 403); res.end(); return; }
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && origin && !allowedOrigins.has(origin)) throw new AppError(403, 'Origine non consentita');
      if (path === '/healthz' && req.method === 'GET') { json(res, 200, { ok: true }); return; }

      let match;
      if (req.method === 'GET' && (match = routeMatch(path, /^\/api\/invitations\/([A-Z0-9]{6})$/))) {
        limit(req, 'invitation', 60);
        json(res, 200, getInvitation(db, match[1])); return;
      }
      if (req.method === 'PUT' && (match = routeMatch(path, /^\/api\/invitations\/([A-Z0-9]{6})\/rsvp$/))) {
        limit(req, 'rsvp', 30);
        json(res, 200, saveRsvp(db, match[1], await body(req, 100_000))); return;
      }
      if (path === '/api/events' && req.method === 'POST') {
        limit(req, 'events', 150);
        json(res, 202, logEvent(db, await body(req, 10_000))); return;
      }

      if (path === '/api/admin/login' && req.method === 'POST') {
        limit(req, 'admin-login', 5);
        const input = await body(req, 10_000);
        if (!verifyPassword(input.password, adminPasswordHash)) throw new AppError(401, 'Credenziali non valide');
        const token = newSessionToken();
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 12 * 60 * 60 * 1000);
        db.prepare('INSERT INTO admin_sessions(token_hash, expires_at, created_at) VALUES(?, ?, ?)')
          .run(tokenHash(token), expiresAt.toISOString(), createdAt.toISOString());
        const secure = production ? '; Secure' : '';
        json(res, 200, { authenticated: true }, { 'Set-Cookie': `${adminCookie}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure}` });
        return;
      }

      if (path.startsWith('/api/admin/')) {
        const token = getCookie(req, adminCookie);
        const session = token && db.prepare('SELECT expires_at FROM admin_sessions WHERE token_hash = ?').get(tokenHash(token));
        if (!session || session.expires_at <= new Date().toISOString()) throw new AppError(401, 'Accesso admin richiesto');
        if (path === '/api/admin/me' && req.method === 'GET') { json(res, 200, { authenticated: true }); return; }
        if (path === '/api/admin/logout' && req.method === 'POST') {
          db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash(token));
          json(res, 200, { authenticated: false }, { 'Set-Cookie': `${adminCookie}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${production ? '; Secure' : ''}` }); return;
        }
        if (path === '/api/admin/dashboard' && req.method === 'GET') { json(res, 200, dashboard(db)); return; }
        if (path === '/api/admin/households' && req.method === 'GET') { json(res, 200, listHouseholds(db, publicBaseUrl, url.searchParams.get('q') || '')); return; }
        if (path === '/api/admin/households' && req.method === 'POST') { json(res, 201, createHousehold(db, await body(req), publicBaseUrl)); return; }
        if (req.method === 'PATCH' && (match = routeMatch(path, /^\/api\/admin\/households\/([A-Za-z0-9_-]{1,64})$/))) {
          updateHousehold(db, match[1], await body(req)); json(res, 200, { updated: true }); return;
        }
        if (req.method === 'POST' && (match = routeMatch(path, /^\/api\/admin\/households\/([A-Za-z0-9_-]{1,64})\/rotate-code$/))) {
          json(res, 200, { code: rotateCode(db, match[1]) }); return;
        }
        if (req.method === 'POST' && (match = routeMatch(path, /^\/api\/admin\/households\/([A-Za-z0-9_-]{1,64})\/guests$/))) {
          json(res, 201, { id: addGuest(db, match[1], await body(req)) }); return;
        }
        if (req.method === 'PATCH' && (match = routeMatch(path, /^\/api\/admin\/guests\/([A-Za-z0-9_-]{1,64})$/))) {
          updateGuest(db, match[1], await body(req)); json(res, 200, { updated: true }); return;
        }
        if (path === '/api/admin/events' && req.method === 'GET') { json(res, 200, listEvents(db, url.searchParams.get('limit'))); return; }
        if (req.method === 'GET' && (match = routeMatch(path, /^\/api\/admin\/export\/(households|guests|rsvps|events)\.csv$/))) {
          const csv = exportCsv(db, match[1], publicBaseUrl);
          res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${match[1]}.csv"`, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' });
          res.end(csv); return;
        }
        if (path === '/api/admin/import/preview' && req.method === 'POST') {
          const input = await body(req);
          const result = previewImport(db, input.householdsCsv, input.guestsCsv);
          json(res, 200, { households: result.households.length, guests: result.guests.length, generatedCodes: result.households.filter((row) => !row.code).length }); return;
        }
        if (path === '/api/admin/import/commit' && req.method === 'POST') {
          const input = await body(req);
          json(res, 200, applyImport(db, input.householdsCsv, input.guestsCsv)); return;
        }
        throw new AppError(404, 'Funzione admin non trovata');
      }

      if (req.method === 'GET' && (path === '/admin' || path.startsWith('/admin/'))) { await serveAdminStatic(path, res, adminDist); return; }
      throw new AppError(404, 'Risorsa non trovata');
    } catch (error) {
      if (!(error instanceof AppError)) console.error(error);
      json(res, error instanceof AppError ? error.status : 500, { error: error instanceof AppError ? error.message : 'Errore del server' });
    }
  });
}
