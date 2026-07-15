-- Run after migrations: inserts default pages.

INSERT INTO pages (slug, title, body, updated_at)
VALUES
  ('home', 'Home', 'Welcome to Santi Sena NGO.', NOW()),
  ('about', 'About', 'About us content here.', NOW()),
  ('services', 'Services', 'Our services list.', NOW()),
  ('contact', 'Contact', 'Contact form info.', NOW())
ON CONFLICT (slug) DO NOTHING;

-- Default donation banks for the public QR Donate page. The admin Donation
-- screen edits these rows (and can add more); qr_url stays empty until an
-- admin uploads a QR image.
INSERT INTO donation_methods (id, bank, subtitle, header_color, qr_url, account_name, account_no, currency, sort_order)
VALUES
  ('aba', 'ABA Pay', 'ABA BANK - CAMBODIA', '#0d2c63', '', 'SANTI SENA', '000 000 000', 'KHR / USD', 0),
  ('acleda', 'ACLEDA Bank', 'ACLEDA - CAMBODIA', '#1d3d5c', '', 'SANTI SENA', '0000 0000 000', 'KHR / USD', 1)
ON CONFLICT (id) DO NOTHING;
