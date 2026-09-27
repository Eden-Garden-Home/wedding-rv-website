CREATE TABLE households (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE CHECK (length(code) = 6),
  display_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE guests (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  attending INTEGER CHECK (attending IN (0, 1)),
  responded_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX guests_household_order ON guests(household_id, sort_order, id);

CREATE TABLE invitation_events (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  dedupe_key TEXT NOT NULL UNIQUE,
  occurred_at TEXT NOT NULL
);
CREATE INDEX invitation_events_household_time ON invitation_events(household_id, occurred_at DESC);

CREATE TABLE rsvp_requests (
  request_id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  payload_hash TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
