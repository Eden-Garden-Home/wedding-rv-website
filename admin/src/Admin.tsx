import { useEffect, useState } from 'react';

type Guest = { id: string; firstName: string; lastName: string; sortOrder: number; active: boolean; attending: boolean | null; respondedAt: string | null; dietaryChoice: 'unanswered' | 'none' | 'needs'; dietaryNote: string; childMenu: boolean };
type Household = { id: string; code: string; displayName: string; active: boolean; url: string; guestCount: number; attendingCount: number; absentCount: number; pendingCount: number; guests: Guest[] };
type Dashboard = { active_households: number; invited: number; attending: number; absent: number; pending: number; events: number };
type Event = { occurred_at: string; code: string; display_name: string; name: string; target: string };
type Tab = 'overview' | 'households' | 'rsvps' | 'events' | 'files';

async function api<T>(path: string, method = 'GET', payload?: unknown): Promise<T> {
  const response = await fetch(`/api/admin${path}`, {
    method,
    credentials: 'same-origin',
    headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Errore ${response.status}`);
  return result as T;
}

function date(value: string | null) { return value ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'; }
function attendanceLabel(value: boolean | null) { return value === null ? 'In attesa' : value ? 'Presente' : 'Assente'; }
const eventLabels: Record<string, string> = {
  link_opened: 'Link aperto', envelope_opened: 'Busta aperta', section_viewed: 'Sezione visitata',
  registry_opened: 'Lista nozze aperta', bank_details_viewed: 'Coordinate visualizzate',
  rsvp_opened: 'RSVP aperto', rsvp_submitted: 'RSVP inviato', rsvp_modified: 'RSVP modificato',
  external_link_clicked: 'Link esterno aperto',
};

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <div className="login-page"><form className="login-card" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await api('/login', 'POST', { password }); onLogin(); }
    catch (issue) { setError((issue as Error).message); }
    finally { setBusy(false); }
  }}><p className="overline">Valentina & Riccardo · 22 maggio 2027</p><h1>Gestione inviti</h1><p>Accesso riservato agli sposi.</p>
    <label>Password amministratore<input autoFocus type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
    {error && <p className="error" role="alert">{error}</p>}
    <button className="button primary" disabled={busy}>{busy ? 'Accesso…' : 'Entra nel pannello'}</button>
  </form></div>;
}

function NewHousehold({ onCreated }: { onCreated: () => Promise<void> }) {
  const [displayName, setDisplayName] = useState('');
  const [people, setPeople] = useState([{ firstName: '', lastName: '' }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <form className="panel new-household" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await api('/households', 'POST', { displayName, guests: people });
      setDisplayName(''); setPeople([{ firstName: '', lastName: '' }]); await onCreated();
    } catch (issue) { setError((issue as Error).message); }
    finally { setBusy(false); }
  }}><div className="panel-head"><div><p className="overline">Nuovo invito</p><h2>Crea un nucleo</h2></div><span className="subtle">Il codice e il link NFC saranno generati automaticamente.</span></div>
    <label>Destinatario sulla busta<input placeholder="Per la famiglia Rossi" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>
    <p className="field-title">Persone invitate</p>
    {people.map((person, index) => <div className="person-inputs" key={index}><label>Nome<input value={person.firstName} onChange={(event) => setPeople(people.map((entry, position) => position === index ? { ...entry, firstName: event.target.value } : entry))} required /></label><label>Cognome<input value={person.lastName} onChange={(event) => setPeople(people.map((entry, position) => position === index ? { ...entry, lastName: event.target.value } : entry))} required /></label>{people.length > 1 && <button type="button" className="button small ghost" onClick={() => setPeople(people.filter((_, position) => position !== index))}>Rimuovi</button>}</div>)}
    <div className="form-actions"><button type="button" className="button secondary" onClick={() => setPeople([...people, { firstName: '', lastName: '' }])}>+ Aggiungi persona</button><button className="button primary" disabled={busy}>{busy ? 'Salvataggio…' : 'Crea invito'}</button></div>
    {error && <p className="error" role="alert">{error}</p>}
  </form>;
}

function GuestEditor({ guest, onSaved }: { guest: Guest; onSaved: () => Promise<void> }) {
  const [firstName, setFirstName] = useState(guest.firstName);
  const [lastName, setLastName] = useState(guest.lastName);
  const [active, setActive] = useState(guest.active);
  const [error, setError] = useState('');
  return <form className="guest-row" onSubmit={async (event) => {
    event.preventDefault(); setError('');
    try { await api(`/guests/${guest.id}`, 'PATCH', { firstName, lastName, active, sortOrder: guest.sortOrder }); await onSaved(); }
    catch (issue) { setError((issue as Error).message); }
  }}><input aria-label="Nome" value={firstName} onChange={(event) => setFirstName(event.target.value)} /><input aria-label="Cognome" value={lastName} onChange={(event) => setLastName(event.target.value)} /><span className={`status ${guest.attending === null ? 'pending' : guest.attending ? 'yes' : 'no'}`}>{attendanceLabel(guest.attending)}</span><label className="check"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Attivo</label><button className="button small secondary">Salva</button>{error && <span className="error">{error}</span>}</form>;
}

function HouseholdEditor({ household, onSaved }: { household: Household; onSaved: () => Promise<void> }) {
  const [displayName, setDisplayName] = useState(household.displayName);
  const [active, setActive] = useState(household.active);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const run = async (work: () => Promise<unknown>, success: string) => {
    setError(''); setMessage('');
    try { await work(); await onSaved(); setMessage(success); }
    catch (issue) { setError((issue as Error).message); }
  };
  return <div className="panel detail-panel"><div className="panel-head"><div><p className="overline">Invito {household.code}</p><h2>Dettagli del nucleo</h2></div><span className={`status ${active ? 'yes' : 'no'}`}>{active ? 'Attivo' : 'Disattivato'}</span></div>
    <form onSubmit={(event) => { event.preventDefault(); void run(() => api(`/households/${household.id}`, 'PATCH', { displayName, active }), 'Nucleo aggiornato.'); }}><div className="editor-line"><label>Destinatario sulla busta<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label><label className="check"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Invito attivo</label><button className="button secondary">Salva</button></div></form>
    <div className="url-box"><div><span className="field-title">Link da scrivere sul tag NFC</span><code>{household.url}</code></div><button className="button secondary" onClick={() => void navigator.clipboard.writeText(household.url).then(() => setMessage('Link copiato.'), () => setError('Copia non riuscita.'))}>Copia link</button></div>
    <button className="button small ghost" onClick={() => { if (window.confirm('Il vecchio link smetterà di funzionare. Generare un nuovo codice?')) void run(() => api(`/households/${household.id}/rotate-code`, 'POST'), 'Nuovo codice generato. Riscrivi il tag NFC.'); }}>Rigenera codice</button>
    <div className="section-separator"><div><p className="overline">Elenco invitati</p><h3>Persone e risposte</h3></div><span className="subtle">{household.guestCount} persone</span></div>
    <div className="guest-list">{household.guests.map((guest) => <GuestEditor key={guest.id} guest={guest} onSaved={onSaved} />)}</div>
    <form className="person-inputs add-person" onSubmit={(event) => { event.preventDefault(); void run(async () => { await api(`/households/${household.id}/guests`, 'POST', { firstName: newFirst, lastName: newLast }); setNewFirst(''); setNewLast(''); }, 'Persona aggiunta.'); }}><label>Nome<input value={newFirst} onChange={(event) => setNewFirst(event.target.value)} required /></label><label>Cognome<input value={newLast} onChange={(event) => setNewLast(event.target.value)} required /></label><button className="button secondary">+ Aggiungi</button></form>
    {error && <p className="error" role="alert">{error}</p>}{message && <p className="success" role="status">{message}</p>}
  </div>;
}

function ImportExport({ onImported }: { onImported: () => Promise<void> }) {
  const [householdsCsv, setHouseholdsCsv] = useState('');
  const [guestsCsv, setGuestsCsv] = useState('');
  const [preview, setPreview] = useState<{ households: number; guests: number; generatedCodes: number } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const read = (file: File | undefined, set: (text: string) => void) => { setPreview(null); setMessage(''); if (file) void file.text().then(set); };
  return <div className="stack"><section className="panel"><p className="overline">Esporta</p><h2>Scarica i dati</h2><p>CSV UTF-8 con separatore punto e virgola, pronto per Excel. L’elenco degli invitati rimane sul server.</p><div className="download-grid">{[['households', 'Nuclei e link NFC'], ['guests', 'Persone invitate'], ['rsvps', 'Risposte RSVP'], ['events', 'Registro attività']].map(([kind, label]) => <a key={kind} className="download-link" href={`/api/admin/export/${kind}.csv`} download>{label}<span>↓ CSV</span></a>)}</div></section>
    <section className="panel"><p className="overline">Importa</p><h2>Aggiorna da due CSV</h2><p>Usa <code>household_id</code> e <code>person_id</code> stabili. L’importazione aggiorna i record presenti e conserva le risposte già ricevute.</p><div className="upload-grid"><label>Nuclei · nuclei.csv<input type="file" accept=".csv,text/csv" onChange={(event) => read(event.target.files?.[0], setHouseholdsCsv)} /></label><label>Persone · persone.csv<input type="file" accept=".csv,text/csv" onChange={(event) => read(event.target.files?.[0], setGuestsCsv)} /></label></div><div className="form-actions"><button className="button secondary" disabled={!householdsCsv || !guestsCsv} onClick={() => void api<{ households: number; guests: number; generatedCodes: number }>('/import/preview', 'POST', { householdsCsv, guestsCsv }).then((result) => { setPreview(result); setError(''); }, (issue) => setError(issue.message))}>Controlla i file</button>{preview && <button className="button primary" onClick={() => void api('/import/commit', 'POST', { householdsCsv, guestsCsv }).then(async () => { setMessage('Importazione completata.'); setPreview(null); await onImported(); }, (issue) => setError(issue.message))}>Importa ora</button>}</div>{preview && <p className="success">{preview.households} nuclei, {preview.guests} persone; {preview.generatedCodes} nuovi codici da generare.</p>}{message && <p className="success">{message}</p>}{error && <p className="error" role="alert">{error}</p>}</section>
  </div>;
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [households, setHouseholds] = useState<Household[]>([]);
  const [stats, setStats] = useState<Dashboard | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const refresh = async () => {
    try {
      const [nextHouseholds, nextStats, nextEvents] = await Promise.all([api<Household[]>('/households'), api<Dashboard>('/dashboard'), api<Event[]>('/events')]);
      setHouseholds(nextHouseholds); setStats(nextStats); setEvents(nextEvents); setError('');
    } catch (issue) { setError((issue as Error).message); }
  };
  useEffect(() => { void api('/me').then(() => { setAuthenticated(true); void refresh(); }, () => setAuthenticated(false)); }, []);
  if (authenticated === null) return <div className="loading">Caricamento del pannello…</div>;
  if (!authenticated) return <Login onLogin={() => { setAuthenticated(true); void refresh(); }} />;
  const filtered = households.filter((row) => `${row.displayName} ${row.code}`.toLocaleLowerCase('it').includes(query.toLocaleLowerCase('it')));
  const selected = households.find((row) => row.id === selectedId);
  const nav: [Tab, string][] = [['overview', 'Panoramica'], ['households', 'Inviti'], ['rsvps', 'RSVP'], ['events', 'Attività'], ['files', 'CSV e NFC']];
  return <div className="admin-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">V<span>&</span>R</span><p>Valentina & Riccardo</p><small>Gestione matrimonio</small></div><nav aria-label="Pannello admin">{nav.map(([id, label]) => <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav><div className="sidebar-bottom"><span>22 MAGGIO 2027</span><button onClick={() => void api('/logout', 'POST').then(() => setAuthenticated(false))}>Esci dal pannello →</button></div></aside>
    <main className="admin-main"><header className="topbar"><div><p className="overline">Area riservata</p><h1>{nav.find(([id]) => id === tab)?.[1]}</h1></div><button className="button secondary" onClick={() => void refresh()}>Aggiorna dati ↻</button></header>{error && <p className="error banner" role="alert">{error}</p>}
      {tab === 'overview' && <div className="stack"><section className="welcome"><p className="overline">Il nostro giorno</p><h2>Ogni invito, ogni risposta,<br />in un solo posto.</h2><p>Prepara i tag NFC, controlla le conferme e segui l’attività degli invitati.</p></section><div className="stat-grid">{[['Nuclei attivi', stats?.active_households], ['Persone invitate', stats?.invited], ['Presenti', stats?.attending], ['Assenti', stats?.absent], ['Da confermare', stats?.pending], ['Eventi registrati', stats?.events]].map(([label, value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value ?? '—'}</strong></div>)}</div><div className="two-col"><section className="panel"><p className="overline">Da seguire</p><h2>Risposte in attesa</h2><div className="mini-list">{households.filter((row) => row.active && row.pendingCount).slice(0, 6).map((row) => <div key={row.id}><span>{row.displayName}</span><b>{row.pendingCount} in attesa</b></div>)}{!households.some((row) => row.active && row.pendingCount) && <p>Tutti hanno risposto.</p>}</div></section><section className="panel"><p className="overline">Ultima attività</p><h2>Movimenti recenti</h2><div className="mini-list">{events.slice(0, 6).map((event, index) => <div key={index}><span>{event.display_name}<small>{eventLabels[event.name] || event.name}</small></span><b>{date(event.occurred_at)}</b></div>)}{!events.length && <p>Nessuna attività registrata.</p>}</div></section></div></div>}
      {tab === 'households' && <div className="stack"><NewHousehold onCreated={refresh} /><section className="panel"><div className="panel-head"><div><p className="overline">Archivio</p><h2>Inviti creati</h2></div><label className="search">Cerca<input placeholder="Nome o codice" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div><div className="household-list">{filtered.map((row) => <button key={row.id} className={`household-item ${selectedId === row.id ? 'active' : ''}`} onClick={() => setSelectedId(row.id)}><span><strong>{row.displayName}</strong><small>{row.code} · {row.guestCount} persone</small></span><span className="household-counts">{row.attendingCount} sì · {row.absentCount} no · {row.pendingCount} in attesa</span><span>→</span></button>)}{!filtered.length && <p>Nessun invito trovato.</p>}</div></section>{selected && <HouseholdEditor key={selected.id} household={selected} onSaved={refresh} />}</div>}
      {tab === 'rsvps' && <section className="panel"><div className="panel-head"><div><p className="overline">Conferme</p><h2>Risposte per persona</h2></div><span className="subtle">{stats?.attending ?? 0} presenti · {stats?.absent ?? 0} assenti</span></div><div className="table-wrap"><table><thead><tr><th>Invito</th><th>Persona</th><th>Risposta</th><th>Esigenze alimentari</th><th>Menù bambino</th><th>Aggiornata</th></tr></thead><tbody>{households.flatMap((row) => row.guests.filter((guest) => guest.active).map((guest) => <tr key={guest.id}><td>{row.displayName}<small>{row.code}</small></td><td>{guest.firstName} {guest.lastName}</td><td><span className={`status ${guest.attending === null ? 'pending' : guest.attending ? 'yes' : 'no'}`}>{attendanceLabel(guest.attending)}</span></td><td>{guest.attending === false ? '—' : guest.dietaryChoice === 'needs' ? guest.dietaryNote : guest.dietaryChoice === 'none' ? 'Nessuna' : 'Da indicare'}</td><td>{guest.attending !== true ? '—' : guest.childMenu ? 'Sì' : 'No'}</td><td>{date(guest.respondedAt)}</td></tr>))}</tbody></table></div></section>}
      {tab === 'events' && <section className="panel"><div className="panel-head"><div><p className="overline">Registro</p><h2>Attività degli inviti</h2></div><a className="button secondary" href="/api/admin/export/events.csv" download>Esporta CSV ↓</a></div><p className="subtle">Solo eventi significativi; nessuna digitazione o movimento del puntatore.</p><div className="table-wrap"><table><thead><tr><th>Quando</th><th>Nucleo</th><th>Evento</th><th>Dettaglio</th></tr></thead><tbody>{events.map((event, index) => <tr key={`${event.occurred_at}-${index}`}><td>{date(event.occurred_at)}</td><td>{event.display_name}<small>{event.code}</small></td><td>{eventLabels[event.name] || event.name}</td><td>{event.target || '—'}</td></tr>)}</tbody></table></div></section>}
      {tab === 'files' && <ImportExport onImported={refresh} />}
      <footer className="admin-footer">Inviti NFC · RSVP · Registro attività <span>Valentina & Riccardo</span></footer>
    </main></div>;
}
