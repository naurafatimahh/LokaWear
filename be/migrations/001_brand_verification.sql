-- Verifikasi brand oleh admin + kota brand.
-- Jalankan SEKALI. Brand yang sudah ada dianggap terverifikasi; brand baru mulai dari 'pending'.
ALTER TABLE brands
  ADD COLUMN city VARCHAR(100) NULL,
  ADD COLUMN verification_status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending';

UPDATE brands SET verification_status = 'verified';

-- Batalkan: ALTER TABLE brands DROP COLUMN city, DROP COLUMN verification_status;
