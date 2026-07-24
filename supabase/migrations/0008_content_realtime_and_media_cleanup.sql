-- Realtime CMS updates and media lifecycle support.
-- The page body remains the JSON contract used by the current frontend, while
-- page revisions keep the previous row snapshot for a short rollback window.

CREATE INDEX IF NOT EXISTS media_assets_bucket_created_idx
  ON public.media_assets (bucket, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS media_assets_google_drive_file_id_key
  ON public.media_assets ((metadata->>'google_drive_file_id'))
  WHERE bucket = 'google-drive'
    AND metadata ? 'google_drive_file_id';

CREATE INDEX IF NOT EXISTS content_revisions_entity_created_idx
  ON public.content_revisions (entity_table, entity_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.capture_page_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.content_revisions
  WHERE entity_table = TG_TABLE_NAME
    AND created_at < now() - interval '7 days';

  IF TG_OP = 'UPDATE' AND to_jsonb(OLD) IS DISTINCT FROM to_jsonb(NEW) THEN
    INSERT INTO public.content_revisions (
      entity_table,
      entity_id,
      action,
      snapshot,
      created_by
    )
    VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'update',
      to_jsonb(OLD),
      auth.uid()
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.content_revisions (
      entity_table,
      entity_id,
      action,
      snapshot,
      created_by
    )
    VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'delete',
      to_jsonb(OLD),
      auth.uid()
    );

    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS capture_page_revision_on_pages ON public.pages;
CREATE TRIGGER capture_page_revision_on_pages
  BEFORE UPDATE OR DELETE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.capture_page_revision();

DO $$
DECLARE
  realtime_table text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    FOREACH realtime_table IN ARRAY ARRAY[
      'pages',
      'home_slides',
      'donation_methods',
      'media_assets',
      'news_posts',
      'partners'
    ] LOOP
      IF to_regclass('public.' || realtime_table) IS NOT NULL THEN
        EXECUTE format(
          'ALTER TABLE public.%I REPLICA IDENTITY FULL',
          realtime_table
        );

        IF NOT EXISTS (
          SELECT 1
          FROM pg_publication_tables
          WHERE pubname = 'supabase_realtime'
            AND schemaname = 'public'
            AND tablename = realtime_table
        ) THEN
          EXECUTE format(
            'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
            realtime_table
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
END;
$$;

SELECT pg_notify('pgrst', 'reload schema');
