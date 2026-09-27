import { createHash, randomInt, randomUUID } from 'node:crypto';
import { transaction } from './database.mjs';
import { csvColumns, parseInvitationCsv, toCsv } from './csv.mjs';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const eventNames = new Set([
  'link_opened', 'envelope_opened', 'section_viewed', 'registry_opened',
  'bank_details_viewed', 'rsvp_opened', 'external_link_clicked',
]);
const stableEvents = new Set(['link_opened', 'section_viewed']);

export class AppError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const fail = (status, message) => { throw new AppError(status, message); };
const validCode = (code) => /^[A-Z0-9]{6}$/.test(code || '');
const validUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
const validId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id);
const cleanName = (value) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 120 || /^[=+\-@\t\r]/.test(value)) fail(400, 'Nome non valido');
  return value.trim();
};
const now = () => new Date().toISOString();
const digest = (value) => createHash('sha256').update(value).digest('hex');

export function generateCode(db) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const code = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join('');
    if (!db.prepare('SELECT 1 FROM households WHERE code = ?').get(code)) return code;
  }
  throw new Error('Impossibile generare un codice univoco');
}

export function invitationUrl(baseUrl, code) {
  const url = new URL(baseUrl);
  url.pathname = '/';
  url.search = new URLSearchParams({ invito: code }).toString();
  url.hash = '';
  return url.toString();
}

export function findHousehold(db, code) {
  if (!validCode(code)) return null;
  return db.prepare('SELECT * FROM households WHERE code = ? AND active = 1').get(code) || null;
}

export function getInvitation(db, code) {
  const household = findHousehold(db, code);
  if (!household) fail(404, 'Invito non disponibile');
  const guests = db.prepare('SELECT id, first_name, last_name, attending, responded_at FROM guests WHERE household_id = ? AND active = 1 ORDER BY sort_order, id').all(household.id);
  return {
    code: household.code,
    displayName: household.display_name,
    guests: guests.map((guest) => ({
      id: guest.id,
      firstName: guest.first_name,
      lastName: guest.last_name,
      attending: guest.attending === null ? null : Boolean(guest.attending),
      respondedAt: guest.responded_at,
    })),
  };
}

export function logEvent(db, input) {
  const { code, name, target = '', eventId, visitId } = input || {};
  const household = findHousehold(db, code);
  if (!household) fail(404, 'Invito non disponibile');
  if (!eventNames.has(name) || !validUuid(eventId) || !validUuid(visitId) || !/^[a-z0-9_-]{0,64}$/.test(target)) fail(400, 'Evento non valido');
  const dedupeKey = stableEvents.has(name) ? `${household.code}:${visitId}:${name}:${target}` : eventId;
  const result = db.prepare('INSERT OR IGNORE INTO invitation_events(id, household_id, invitation_code, name, target, dedupe_key, occurred_at) VALUES(?, ?, ?, ?, ?, ?, ?)')
    .run(eventId, household.id, household.code, name, target, dedupeKey, now());
  return { recorded: result.changes === 1 };
}

export function saveRsvp(db, code, input) {
  const household = findHousehold(db, code);
  if (!household) fail(404, 'Invito non disponibile');
  const { requestId, responses } = input || {};
  if (!validUuid(requestId) || !Array.isArray(responses)) fail(400, 'Risposta non valida');
  const guestRows = db.prepare('SELECT id, attending FROM guests WHERE household_id = ? AND active = 1 ORDER BY id').all(household.id);
  if (!guestRows.length || responses.length !== guestRows.length) fail(400, 'Indica una risposta per ogni invitato');
  const byId = new Map();
  for (const response of responses) {
    if (!response || !validId(response.guestId) || typeof response.attending !== 'boolean' || byId.has(response.guestId)) fail(400, 'Risposta non valida');
    byId.set(response.guestId, response.attending);
  }
  if (guestRows.some((guest) => !byId.has(guest.id))) fail(400, 'Indica una risposta per ogni invitato');
  const canonical = guestRows.map((guest) => ({ guestId: guest.id, attending: byId.get(guest.id) }));
  const payloadHash = digest(JSON.stringify(canonical));
  return transaction(db, () => {
    const previousRequest = db.prepare('SELECT household_id, payload_hash, response_json FROM rsvp_requests WHERE request_id = ?').get(requestId);
    if (previousRequest) {
      if (previousRequest.household_id !== household.id || previousRequest.payload_hash !== payloadHash) fail(409, 'Questa richiesta è già stata usata per dati diversi');
      return JSON.parse(previousRequest.response_json);
    }
    const changed = guestRows.some((guest) => guest.attending === null || Boolean(guest.attending) !== byId.get(guest.id));
    const firstSubmission = guestRows.every((guest) => guest.attending === null);
    const savedAt = now();
    if (changed) {
      const update = db.prepare('UPDATE guests SET attending = ?, responded_at = ?, updated_at = ? WHERE id = ? AND household_id = ?');
      for (const response of canonical) update.run(Number(response.attending), savedAt, savedAt, response.guestId, household.id);
      db.prepare('INSERT INTO invitation_events(id, household_id, invitation_code, name, target, dedupe_key, occurred_at) VALUES(?, ?, ?, ?, ?, ?, ?)')
        .run(randomUUID(), household.id, household.code, firstSubmission ? 'rsvp_submitted' : 'rsvp_modified', 'rsvp', `rsvp:${requestId}`, savedAt);
    }
    const result = { saved: true, changed, savedAt, responses: canonical };
    db.prepare('INSERT INTO rsvp_requests(request_id, household_id, payload_hash, response_json, created_at) VALUES(?, ?, ?, ?, ?)')
      .run(requestId, household.id, payloadHash, JSON.stringify(result), savedAt);
    return result;
  });
}

export function listHouseholds(db, baseUrl, query = '') {
  const rows = db.prepare(`SELECT h.id, h.code, h.display_name, h.active, h.created_at, h.updated_at,
      COUNT(g.id) AS guest_count,
      SUM(CASE WHEN g.attending = 1 AND g.active = 1 THEN 1 ELSE 0 END) AS attending_count,
      SUM(CASE WHEN g.attending = 0 AND g.active = 1 THEN 1 ELSE 0 END) AS absent_count,
      SUM(CASE WHEN g.attending IS NULL AND g.active = 1 THEN 1 ELSE 0 END) AS pending_count
    FROM households h LEFT JOIN guests g ON g.household_id = h.id AND g.active = 1
    GROUP BY h.id ORDER BY h.created_at DESC`).all();
  const lower = query.toLocaleLowerCase('it');
  return rows.filter((row) => !lower || `${row.display_name} ${row.code}`.toLocaleLowerCase('it').includes(lower)).map((row) => ({
    id: row.id, code: row.code, displayName: row.display_name, active: Boolean(row.active),
    url: invitationUrl(baseUrl, row.code), guestCount: row.guest_count,
    attendingCount: row.attending_count, absentCount: row.absent_count, pendingCount: row.pending_count,
    guests: db.prepare('SELECT id, first_name, last_name, sort_order, active, attending, responded_at FROM guests WHERE household_id = ? ORDER BY sort_order, id').all(row.id)
      .map((guest) => ({ id: guest.id, firstName: guest.first_name, lastName: guest.last_name, sortOrder: guest.sort_order, active: Boolean(guest.active), attending: guest.attending === null ? null : Boolean(guest.attending), respondedAt: guest.responded_at })),
  }));
}

export function createHousehold(db, input, baseUrl) {
  const displayName = cleanName(input?.displayName);
  const guests = input?.guests;
  if (!Array.isArray(guests) || guests.length < 1 || guests.length > 30) fail(400, 'Aggiungi da 1 a 30 persone');
  const id = randomUUID();
  const code = generateCode(db);
  const createdAt = now();
  transaction(db, () => {
    db.prepare('INSERT INTO households(id, code, display_name, active, created_at, updated_at) VALUES(?, ?, ?, 1, ?, ?)').run(id, code, displayName, createdAt, createdAt);
    const insert = db.prepare('INSERT INTO guests(id, household_id, first_name, last_name, sort_order, active, created_at, updated_at) VALUES(?, ?, ?, ?, ?, 1, ?, ?)');
    guests.forEach((guest, index) => insert.run(randomUUID(), id, cleanName(guest.firstName), cleanName(guest.lastName), index, createdAt, createdAt));
  });
  return listHouseholds(db, baseUrl).find((row) => row.id === id);
}

export function updateHousehold(db, id, input) {
  if (!validId(id)) fail(400, 'Identificatore non valido');
  const existing = db.prepare('SELECT id FROM households WHERE id = ?').get(id);
  if (!existing) fail(404, 'Nucleo non trovato');
  const displayName = cleanName(input?.displayName);
  if (typeof input?.active !== 'boolean') fail(400, 'Stato non valido');
  db.prepare('UPDATE households SET display_name = ?, active = ?, updated_at = ? WHERE id = ?').run(displayName, Number(input.active), now(), id);
}

export function rotateCode(db, id) {
  if (!validId(id) || !db.prepare('SELECT id FROM households WHERE id = ?').get(id)) fail(404, 'Nucleo non trovato');
  const code = generateCode(db);
  db.prepare('UPDATE households SET code = ?, updated_at = ? WHERE id = ?').run(code, now(), id);
  return code;
}

export function addGuest(db, householdId, input) {
  if (!validId(householdId) || !db.prepare('SELECT id FROM households WHERE id = ?').get(householdId)) fail(404, 'Nucleo non trovato');
  const firstName = cleanName(input?.firstName);
  const lastName = cleanName(input?.lastName);
  const order = db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM guests WHERE household_id = ?').get(householdId).next_order;
  const createdAt = now();
  const id = randomUUID();
  db.prepare('INSERT INTO guests(id, household_id, first_name, last_name, sort_order, active, created_at, updated_at) VALUES(?, ?, ?, ?, ?, 1, ?, ?)')
    .run(id, householdId, firstName, lastName, order, createdAt, createdAt);
  return id;
}

export function updateGuest(db, id, input) {
  const existing = validId(id) && db.prepare('SELECT id, household_id, active FROM guests WHERE id = ?').get(id);
  if (!existing) fail(404, 'Persona non trovata');
  const firstName = cleanName(input?.firstName);
  const lastName = cleanName(input?.lastName);
  if (typeof input?.active !== 'boolean' || !Number.isSafeInteger(input?.sortOrder) || input.sortOrder < 0) fail(400, 'Dati non validi');
  if (existing.active && !input.active && db.prepare('SELECT COUNT(*) AS count FROM guests WHERE household_id = ? AND active = 1').get(existing.household_id).count <= 1) {
    fail(400, 'Il nucleo deve avere almeno una persona attiva');
  }
  db.prepare('UPDATE guests SET first_name = ?, last_name = ?, active = ?, sort_order = ?, updated_at = ? WHERE id = ?')
    .run(firstName, lastName, Number(input.active), input.sortOrder, now(), id);
}

export function previewImport(db, householdCsv, guestCsv) {
  let parsed;
  try { parsed = parseInvitationCsv(householdCsv, guestCsv); }
  catch (error) { fail(400, error.message); }
  for (const row of parsed.households) {
    if (row.code) {
      const owner = db.prepare('SELECT id FROM households WHERE code = ?').get(row.code);
      if (owner && owner.id !== row.id) fail(409, `Codice ${row.code} già assegnato a un altro nucleo`);
    }
  }
  for (const row of parsed.guests) {
    const owner = db.prepare('SELECT household_id FROM guests WHERE id = ?').get(row.id);
    if (owner && owner.household_id !== row.householdId) fail(409, `Persona ${row.id} appartiene a un altro nucleo`);
  }
  return parsed;
}

export function applyImport(db, householdCsv, guestCsv) {
  const parsed = previewImport(db, householdCsv, guestCsv);
  transaction(db, () => {
    const timestamp = now();
    for (const row of parsed.households) {
      const existing = db.prepare('SELECT code FROM households WHERE id = ?').get(row.id);
      const code = row.code || existing?.code || generateCode(db);
      db.prepare(`INSERT INTO households(id, code, display_name, active, created_at, updated_at)
        VALUES(?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET code=excluded.code, display_name=excluded.display_name, active=excluded.active, updated_at=excluded.updated_at`)
        .run(row.id, code, row.displayName, row.active, timestamp, timestamp);
    }
    for (const row of parsed.guests) {
      db.prepare(`INSERT INTO guests(id, household_id, first_name, last_name, sort_order, active, created_at, updated_at)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET first_name=excluded.first_name, last_name=excluded.last_name,
        sort_order=excluded.sort_order, active=excluded.active, updated_at=excluded.updated_at`)
        .run(row.id, row.householdId, row.firstName, row.lastName, row.sortOrder, row.active, timestamp, timestamp);
    }
  });
  return { households: parsed.households.length, guests: parsed.guests.length };
}

export function dashboard(db) {
  const counts = db.prepare(`SELECT
    (SELECT COUNT(*) FROM households WHERE active=1) AS active_households,
    (SELECT COUNT(*) FROM guests g JOIN households h ON h.id=g.household_id WHERE g.active=1 AND h.active=1) AS invited,
    (SELECT COUNT(*) FROM guests g JOIN households h ON h.id=g.household_id WHERE g.active=1 AND h.active=1 AND g.attending=1) AS attending,
    (SELECT COUNT(*) FROM guests g JOIN households h ON h.id=g.household_id WHERE g.active=1 AND h.active=1 AND g.attending=0) AS absent,
    (SELECT COUNT(*) FROM invitation_events) AS events`).get();
  return { ...counts, pending: counts.invited - counts.attending - counts.absent };
}

export function listEvents(db, limit = 200) {
  return db.prepare(`SELECT e.occurred_at, e.invitation_code AS code, h.display_name, e.name, e.target
    FROM invitation_events e JOIN households h ON h.id=e.household_id
    ORDER BY e.occurred_at DESC LIMIT ?`).all(Math.max(1, Math.min(1000, Number(limit) || 200)));
}

export function exportCsv(db, kind, baseUrl) {
  if (kind === 'households') {
    const rows = db.prepare('SELECT id, code, display_name, active FROM households ORDER BY display_name').all();
    return toCsv([...csvColumns.households, 'nfc_url'], rows.map((row) => ({
      household_id: row.id, code: row.code, display_name: row.display_name, active: row.active,
      nfc_url: invitationUrl(baseUrl, row.code),
    })));
  }
  if (kind === 'guests') {
    const rows = db.prepare('SELECT id, household_id, first_name, last_name, sort_order, active FROM guests ORDER BY household_id, sort_order, id').all();
    return toCsv(csvColumns.guests, rows.map((row) => ({
      person_id: row.id, household_id: row.household_id, first_name: row.first_name,
      last_name: row.last_name, sort_order: row.sort_order, active: row.active,
    })));
  }
  if (kind === 'rsvps') {
    return toCsv(['household_id', 'code', 'display_name', 'person_id', 'first_name', 'last_name', 'attendance', 'responded_at'],
      db.prepare(`SELECT h.id AS household_id, h.code, h.display_name, g.id AS person_id, g.first_name, g.last_name,
        g.attending, g.responded_at FROM guests g JOIN households h ON h.id=g.household_id ORDER BY h.display_name, g.sort_order`).all()
        .map((row) => ({ ...row, attendance: row.attending === null ? 'in_attesa' : row.attending ? 'presente' : 'assente' })));
  }
  if (kind === 'events') {
    return toCsv(['occurred_at', 'code', 'display_name', 'event_name', 'target'],
      db.prepare(`SELECT e.occurred_at, e.invitation_code AS code, h.display_name, e.name AS event_name, e.target
        FROM invitation_events e JOIN households h ON h.id=e.household_id ORDER BY e.occurred_at`).all());
  }
  fail(404, 'Esportazione non trovata');
}
