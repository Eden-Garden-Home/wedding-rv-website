ALTER TABLE guests ADD COLUMN dietary_note TEXT NOT NULL DEFAULT '';
ALTER TABLE guests ADD COLUMN dietary_choice TEXT NOT NULL DEFAULT 'unanswered' CHECK (dietary_choice IN ('unanswered', 'none', 'needs'));
ALTER TABLE guests ADD COLUMN child_menu INTEGER NOT NULL DEFAULT 0 CHECK (child_menu IN (0, 1));
