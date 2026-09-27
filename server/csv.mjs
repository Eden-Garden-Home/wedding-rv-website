import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const householdColumns = ['household_id', 'code', 'display_name', 'active'];
const guestColumns = ['person_id', 'household_id', 'first_name', 'last_name', 'sort_order', 'active'];

function readCsv(text, columns) {
  if (typeof text !== 'string' || text.length > 2_000_000) throw new Error('CSV mancante o troppo grande');
  const rows = parse(text, { bom: true, columns: true, delimiter: ';', skip_empty_lines: true, trim: true });
  const header = parse(text, { bom: true, delimiter: ';', to_line: 1 })[0] || [];
  if (columns.some((column) => !header.includes(column))) throw new Error(`Intestazioni richieste: ${columns.join(';')}`);
  if (rows.length > 5000) throw new Error('Troppi record nel CSV');
  return rows;
}

function name(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 120 || /^[=+\-@\t\r]/.test(value)) {
    throw new Error(`${label} non valido`);
  }
  return value.trim();
}

function id(value, label) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(value || '')) throw new Error(`${label} non valido`);
  return value;
}

function active(value) {
  if (['1', 'true', 'sì', 'si'].includes(String(value).toLowerCase())) return 1;
  if (['0', 'false', 'no'].includes(String(value).toLowerCase())) return 0;
  throw new Error('La colonna active deve contenere 1 oppure 0');
}

export function parseInvitationCsv(householdCsv, guestCsv) {
  const households = readCsv(householdCsv, householdColumns).map((row, index) => {
    try {
      return {
        id: id(row.household_id, 'household_id'),
        code: row.code ? String(row.code).toUpperCase() : '',
        displayName: name(row.display_name, 'display_name'),
        active: active(row.active),
      };
    } catch (error) { throw new Error(`nuclei.csv riga ${index + 2}: ${error.message}`); }
  });
  const guests = readCsv(guestCsv, guestColumns).map((row, index) => {
    try {
      const order = Number(row.sort_order);
      if (!Number.isSafeInteger(order) || order < 0 || order > 10000) throw new Error('sort_order non valido');
      return {
        id: id(row.person_id, 'person_id'),
        householdId: id(row.household_id, 'household_id'),
        firstName: name(row.first_name, 'first_name'),
        lastName: name(row.last_name, 'last_name'),
        sortOrder: order,
        active: active(row.active),
      };
    } catch (error) { throw new Error(`persone.csv riga ${index + 2}: ${error.message}`); }
  });
  if (households.length === 0) throw new Error('nuclei.csv non contiene dati');
  const householdIds = new Set(households.map((row) => row.id));
  if (householdIds.size !== households.length) throw new Error('household_id duplicato');
  if (new Set(guests.map((row) => row.id)).size !== guests.length) throw new Error('person_id duplicato');
  for (const guest of guests) if (!householdIds.has(guest.householdId)) throw new Error(`Nucleo ${guest.householdId} mancante per ${guest.id}`);
  for (const household of households) {
    if (!guests.some((guest) => guest.householdId === household.id && guest.active)) {
      throw new Error(`Il nucleo ${household.id} deve avere almeno una persona attiva`);
    }
  }
  const codes = households.map((row) => row.code).filter(Boolean);
  if (codes.some((code) => !/^[A-Z0-9]{6}$/.test(code))) throw new Error('I codici devono essere alfanumerici di 6 caratteri');
  if (new Set(codes).size !== codes.length) throw new Error('Codice invito duplicato nel CSV');
  return { households, guests };
}

export function toCsv(columns, rows) {
  return stringify(rows, { header: true, columns, delimiter: ';', record_delimiter: '\r\n', bom: true });
}

export const csvColumns = { households: householdColumns, guests: guestColumns };
