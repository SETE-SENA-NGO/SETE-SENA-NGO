-- ============================================================
-- MIGRATION 0009: Enable real-time for the programs table
-- ============================================================
-- The public EducationView, ChildProtectionView, EnvironmentView,
-- and LivelihoodView all subscribe to postgres_changes on the
-- programs table. Without this migration, those subscriptions
-- never fire because the table isn't in the publication.
-- ============================================================
-- Run this in the Supabase SQL Editor (Project Settings → SQL Editor)
-- or via: npx supabase db push
-- SAFE to run multiple times.
-- ============================================================

DO $$
DECLARE
  target_table text := 'programs';
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Ensure REPLICA IDENTITY FULL so the full row is sent on every change
    IF to_regclass('public.' || target_table) IS NOT NULL THEN
      EXECUTE format(
        'ALTER TABLE public.%I REPLICA IDENTITY FULL',
        target_table
      );

      -- Add to the publication if not already present
      IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = target_table
      ) THEN
        EXECUTE format(
          'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
          target_table
        );
        RAISE NOTICE '✅ Added "%" to supabase_realtime publication.', target_table;
      ELSE
        RAISE NOTICE 'ℹ️ "%" is already in supabase_realtime publication.', target_table;
      END IF;
    END IF;
  ELSE
    RAISE WARNING '⚠️  supabase_realtime publication does not exist. Create it first in the Supabase dashboard: Database → Replication.';
  END IF;
END;
$$;

-- Refresh the schema cache so Supabase API picks up the change immediately
NOTIFY pgrst, 'reload schema';
