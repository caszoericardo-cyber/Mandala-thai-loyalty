-- ════════════════════════════════════════════════════════════════
-- Mandala Thai — Migración de datos iniciales
-- ════════════════════════════════════════════════════════════════
-- Ejecuta esto DESPUÉS de haber corrido supabase-schema.sql.
-- Supabase → SQL Editor → New Query → pega todo → Run.
--
-- Si ya corriste el schema con sus datos de ejemplo (experiences,
-- rewards, staff_members) y quieres reemplazarlos con estos,
-- descomenta las líneas TRUNCATE al inicio de cada sección.

-- ── Experiencias ─────────────────────────────────────────────────
-- TRUNCATE experiences RESTART IDENTITY CASCADE;
insert into experiences (label, label_en, pts, icon) values
  ('Hospedaje Sencillo',    'Standard Stay',   10, '🌿'),
  ('Noche Romántica',       'Romantic Night',  20, '🌙'),
  ('Experiencia Romántica', 'Full Experience', 30, '✨')
on conflict do nothing;

-- ── Recompensas ───────────────────────────────────────────────────
-- TRUNCATE rewards RESTART IDENTITY CASCADE;
insert into rewards (label, label_en, cost, icon) values
  ('Masaje Gratuito',   'Free Massage',       50,  '💆'),
  ('Noche de Cortesía', 'Complimentary Night', 100, '🏡')
on conflict do nothing;

-- ── Personal ──────────────────────────────────────────────────────
-- TRUNCATE staff_members RESTART IDENTITY CASCADE;
insert into staff_members (name, pin, role) values
  ('Admin Principal', '1234', 'admin'),
  ('Recepción',       '5678', 'staff')
on conflict do nothing;

-- ── Clientes ─────────────────────────────────────────────────────
insert into clients (id, name, email, phone, points, last_visit, redeem_request) values
  ('MT-2026-01', 'Sofía Ramírez',  '', '555-0101', 70, '2026-05-27', null),
  ('MT-2026-02', 'Carlos Mendoza', '', '555-0202', 40, '2026-05-27', null)
on conflict (id) do nothing;

-- ── Historial de Sofía (MT-2026-01) ──────────────────────────────
insert into history (client_id, date, type, delta) values
  ('MT-2026-01', '15/03/2026', 'Experiencia Romántica',   30),
  ('MT-2026-01', '02/04/2026', 'Noche Romántica',         20),
  ('MT-2026-01', '18/05/2026', 'Hospedaje Sencillo',      10),
  ('MT-2026-01', '20/05/2026', 'Canje: Masaje Gratuito', -50),
  ('MT-2026-01', '27/05/2026', 'Experiencia Romántica',   30),
  ('MT-2026-01', '27/05/2026', 'Noche Romántica',         20);

-- ── Historial de Carlos (MT-2026-02) ─────────────────────────────
insert into history (client_id, date, type, delta) values
  ('MT-2026-02', '10/04/2026', 'Noche Romántica',         20),
  ('MT-2026-02', '25/04/2026', 'Hospedaje Sencillo',      10),
  ('MT-2026-02', '12/05/2026', 'Noche Romántica',         20),
  ('MT-2026-02', '20/05/2026', 'Canje: Masaje Gratuito', -50),
  ('MT-2026-02', '27/05/2026', 'Hospedaje Sencillo',      10),
  ('MT-2026-02', '27/05/2026', 'Hospedaje Sencillo',      10),
  ('MT-2026-02', '27/05/2026', 'Hospedaje Sencillo',      10);

-- ── Notificaciones de Sofía ───────────────────────────────────────
insert into notifications (client_id, msg, read) values
  ('MT-2026-01', '¡Bienvenida al programa Mandala Thai! Tienes 70 puntos.', false);

-- ── Notificaciones de Carlos ──────────────────────────────────────
insert into notifications (client_id, msg, read) values
  ('MT-2026-02', '¡Bienvenido al programa Mandala Thai! Tienes 40 puntos.', false);
