ALTER TABLE invitation_events ADD COLUMN invitation_code TEXT NOT NULL DEFAULT '';
UPDATE invitation_events
SET invitation_code = (SELECT code FROM households WHERE households.id = invitation_events.household_id);
