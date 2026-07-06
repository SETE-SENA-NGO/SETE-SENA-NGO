-- Run after migrations: inserts default pages.

INSERT INTO pages (slug, title, body, updated_at)
VALUES
  ('home', 'Home', 'Welcome to Santi Sena NGO.', NOW()),
  ('about', 'About', 'About us content here.', NOW()),
  ('services', 'Services', 'Our services list.', NOW()),
  ('contact', 'Contact', 'Contact form info.', NOW())
ON CONFLICT (slug) DO NOTHING;
