export type DietaryChoice = 'unanswered' | 'none' | 'needs';
export type InviteGuest = { id: string; firstName: string; lastName: string; attending: boolean | null; respondedAt: string | null; dietaryChoice: DietaryChoice; dietaryNote: string; childMenu: boolean };
export type Invitation = { code: string; displayName: string; guests: InviteGuest[] };
export type RsvpResponse = { guestId: string; attending: boolean; dietaryChoice: DietaryChoice; dietaryNote: string; childMenu: boolean };

const apiBase = import.meta.env.DEV ? 'http://127.0.0.1:8787' : '';
const visitKey = 'wedding-invitation-visit';

export function invitationCodeFromUrl() {
  const code = new URLSearchParams(window.location.search).get('invito')?.toUpperCase() || '';
  return /^[A-Z0-9]{6}$/.test(code) ? code : null;
}

function visitId() {
  try {
    const existing = sessionStorage.getItem(visitKey);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(visitKey, created);
    return created;
  } catch { return crypto.randomUUID(); }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, { cache: 'no-store', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Il server non è disponibile. Riprova più tardi.');
  return data as T;
}

export function loadInvitation(code: string, signal?: AbortSignal) {
  return request<Invitation>(`/api/invitations/${code}`, { signal });
}

export function recordEvent(code: string, name: string, target = '') {
  void request('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, name, target, eventId: crypto.randomUUID(), visitId: visitId() }),
    keepalive: true,
  }).catch(() => { /* Tracking never interrupts the invitation. */ });
}

export function submitRsvp(code: string, responses: RsvpResponse[], requestId: string) {
  return request<{ saved: boolean; changed: boolean; savedAt: string; responses: RsvpResponse[] }>(`/api/invitations/${code}/rsvp`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, responses }),
  });
}
