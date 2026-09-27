import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { openDatabase } from '../server/database.mjs';
import { createHttpServer } from '../server/http.mjs';
import { hashPassword } from '../server/password.mjs';
import { applyImport, createHousehold, exportCsv, getInvitation, logEvent, rotateCode, saveRsvp, updateGuest } from '../server/core.mjs';
import { parseInvitationCsv } from '../server/csv.mjs';

const base = 'https://valentinaericcardo.world';
const family = { displayName: 'Per la famiglia Rossi', guests: [{ firstName: 'Giulia', lastName: 'Rossi' }, { firstName: 'Marco', lastName: 'Rossi' }] };

test('codici univoci, dati del solo nucleo e link NFC', () => {
  const db = openDatabase(':memory:');
  try {
    const first = createHousehold(db, family, base);
    const second = createHousehold(db, { displayName: 'Per Anna', guests: [{ firstName: 'Anna', lastName: 'Verdi' }] }, base);
    assert.match(first.code, /^[A-Z0-9]{6}$/);
    assert.notEqual(first.code, second.code);
    assert.throws(() => updateGuest(db, second.guests[0].id, { firstName: 'Anna', lastName: 'Verdi', sortOrder: 0, active: false }), { status: 400 });
    assert.equal(first.url, `${base}/?invito=${first.code}`);
    assert.deepEqual(getInvitation(db, first.code).guests.map(({ firstName }) => firstName), ['Giulia', 'Marco']);
    assert.equal(getInvitation(db, first.code).displayName, family.displayName);
    assert.throws(() => getInvitation(db, 'BAD'), { status: 404 });
    assert.throws(() => getInvitation(db, 'AAAAAA'), { status: 404 });
    const old = first.code;
    rotateCode(db, first.id);
    assert.throws(() => getInvitation(db, old), { status: 404 });
    assert.notEqual(getInvitation(db, db.prepare('SELECT code FROM households WHERE id = ?').get(first.id).code).code, old);
    db.prepare('UPDATE households SET active = 0 WHERE id = ?').run(first.id);
    assert.throws(() => getInvitation(db, db.prepare('SELECT code FROM households WHERE id = ?').get(first.id).code), { status: 404 });
  } finally { db.close(); }
});

test('RSVP per persona: conferma, modifica e ritrasmissione idempotente', () => {
  const db = openDatabase(':memory:');
  try {
    const row = createHousehold(db, family, base);
    const [first, second] = row.guests;
    const requestId = randomUUID();
    const initial = { requestId, responses: [{ guestId: first.id, attending: true }, { guestId: second.id, attending: false }] };
    assert.throws(() => saveRsvp(db, row.code, { requestId: randomUUID(), responses: initial.responses.slice(0, 1) }), { status: 400 });
    const saved = saveRsvp(db, row.code, initial);
    assert.equal(saved.saved, true);
    assert.equal(saveRsvp(db, row.code, initial).savedAt, saved.savedAt);
    assert.deepEqual(getInvitation(db, row.code).guests.map(({ attending }) => attending), [true, false]);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM invitation_events WHERE name = ?').get('rsvp_submitted').count, 1);
    assert.throws(() => saveRsvp(db, row.code, { ...initial, responses: [{ guestId: first.id, attending: false }, initial.responses[1]] }), { status: 409 });
    saveRsvp(db, row.code, { requestId: randomUUID(), responses: [{ guestId: first.id, attending: true }, { guestId: second.id, attending: true }] });
    assert.deepEqual(getInvitation(db, row.code).guests.map(({ attending }) => attending), [true, true]);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM invitation_events WHERE name = ?').get('rsvp_modified').count, 1);
  } finally { db.close(); }
});

test('eventi significativi deduplicati per visita ed esportati con data e codice', () => {
  const db = openDatabase(':memory:');
  try {
    const row = createHousehold(db, family, base);
    const visitId = randomUUID();
    assert.deepEqual(logEvent(db, { code: row.code, name: 'section_viewed', target: 'programma', visitId, eventId: randomUUID() }), { recorded: true });
    assert.deepEqual(logEvent(db, { code: row.code, name: 'section_viewed', target: 'programma', visitId, eventId: randomUUID() }), { recorded: false });
    logEvent(db, { code: row.code, name: 'external_link_clicked', target: 'maps_church', visitId, eventId: randomUUID() });
    assert.throws(() => logEvent(db, { code: row.code, name: 'pointer_moved', visitId, eventId: randomUUID() }), { status: 400 });
    rotateCode(db, row.id);
    const csv = exportCsv(db, 'events', base);
    assert.match(csv, /occurred_at;code;display_name;event_name;target/);
    assert.match(csv, new RegExp(row.code));
    assert.equal((csv.match(/section_viewed/g) || []).length, 1);
  } finally { db.close(); }
});

test('CSV Excel: import collegato, aggiornamento e risposta conservata', () => {
  const db = openDatabase(':memory:');
  try {
    const row = createHousehold(db, family, base);
    const old = row.guests[0];
    saveRsvp(db, row.code, { requestId: randomUUID(), responses: row.guests.map((guest) => ({ guestId: guest.id, attending: true })) });
    const households = exportCsv(db, 'households', base);
    const guests = exportCsv(db, 'guests', base).replace('Giulia', 'Giulietta');
    assert.equal(parseInvitationCsv(households, guests).guests.length, 2);
    assert.deepEqual(applyImport(db, households, guests), { households: 1, guests: 2 });
    assert.equal(getInvitation(db, row.code).guests[0].firstName, 'Giulietta');
    assert.equal(db.prepare('SELECT attending FROM guests WHERE id = ?').get(old.id).attending, 1);
    assert.match(exportCsv(db, 'rsvps', base), /presente/);
    assert.match(exportCsv(db, 'households', base), new RegExp(`\\?invito=${row.code}`));
    assert.throws(() => parseInvitationCsv(households, 'person_id;household_id;first_name;last_name;sort_order;active\r\n'), /persona attiva/);
  } finally { db.close(); }
});

test('API: admin richiede sessione, inviti invalidi non rivelano dati', async () => {
  const db = openDatabase(':memory:');
  const row = createHousehold(db, family, base);
  const server = createHttpServer({ db, adminPasswordHash: hashPassword('local-test-password-123'), publicBaseUrl: base });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const privateResponse = await fetch(`${url}/api/admin/households`);
    assert.equal(privateResponse.status, 401);
    const unavailable = await fetch(`${url}/api/invitations/AAAAAA`);
    assert.equal(unavailable.status, 404);
    assert.equal((await unavailable.json()).error, 'Invito non disponibile');
    const publicResponse = await fetch(`${url}/api/invitations/${row.code}`);
    assert.equal(publicResponse.status, 200);
    assert.equal((await publicResponse.json()).guests.length, 2);
    const login = await fetch(`${url}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'local-test-password-123' }) });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const admin = await fetch(`${url}/api/admin/households`, { headers: { Cookie: cookie } });
    assert.equal(admin.status, 200);
    assert.equal((await admin.json())[0].code, row.code);
    const csv = await fetch(`${url}/api/admin/export/guests.csv`, { headers: { Cookie: cookie } });
    assert.equal(csv.status, 200);
    assert.match(await csv.text(), /Giulia/);
  } finally { await new Promise((resolve) => server.close(resolve)); db.close(); }
});
