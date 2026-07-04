-- ════════════════════════════════════════════════════════════════
-- Mandala Thai Loyalty App — Esquema de Base de Datos para Supabase
-- ════════════════════════════════════════════════════════════════
-- Cómo usar: Supabase → tu proyecto → SQL Editor → New Query
-- Pega todo este archivo y dale "Run".

-- ── Tabla: clients ──────────────────────────────────────────────
create table if not exists clients (
  id text primary key,                  -- ej: "MT-2026-01"
  name text not null,
  email text,
  phone text UNIQUE not null,
  points integer not null default 0,
  last_visit date not null default current_date,
  redeem_request integer,         -- id de la recompensa solicitada (o null)
  created_at timestamptz not null default now()
);

-- ── Tabla: history (historial de visitas/canjes por cliente) ───
create table if not exists history (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references clients(id) on delete cascade,
  date text not null,                   -- formato DD/MM/AAAA, igual que en el front
  type text not null,
  delta integer not null,
  created_at timestamptz not null default now()
);

-- ── Tabla: notifications (notificaciones por cliente) ───────────
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references clients(id) on delete cascade,
  msg text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Tabla: experiences (catálogo de experiencias que dan puntos)─
create table if not exists experiences (
  id integer generated always as identity primary key,
  label text not null,
  label_en text,
  pts integer not null,
  icon text default '⭐'
);

-- ── Tabla: rewards (catálogo de recompensas canjeables) ─────────
create table if not exists rewards (
  id integer generated always as identity primary key,
  label text not null,
  label_en text,
  cost integer not null,
  icon text default '🏅'
);

-- ── Tabla: staff_members (personal con acceso por PIN) ───────────
create table if not exists staff_members (
  id integer generated always as identity primary key,
  name text not null,
  pin text not null,
  role text not null default 'staff'    -- 'admin' | 'staff'
);

-- ════════════════════════════════════════════════════════════════
-- Seguridad (RLS) — IMPORTANTE LEER
-- ════════════════════════════════════════════════════════════════
-- Esta app no tiene login de Supabase Auth: el control de acceso del
-- panel admin lo hace el PIN dentro del propio código React, no la
-- base de datos. Por eso aquí abrimos políticas permisivas con la
-- clave "anon" para que la app funcione tal cual.
--
-- Esto significa que CUALQUIERA con tu anon key (que es pública, va
-- en el código del navegador) puede leer y escribir estas tablas.
-- Es razonable para una app interna de bajo riesgo, pero si más
-- adelante quieres más seguridad real, lo correcto es mover las
-- escrituras de "admin" a un backend (Supabase Edge Function) que
-- valide el PIN del lado del servidor antes de escribir.

alter table clients enable row level security;
alter table history enable row level security;
alter table notifications enable row level security;
alter table experiences enable row level security;
alter table rewards enable row level security;
alter table staff_members enable row level security;

create policy "public read clients" on clients for select using (true);
create policy "public insert clients" on clients for insert with check (true);
create policy "public update clients" on clients for update using (true);

create policy "public read history" on history for select using (true);
create policy "public insert history" on history for insert with check (true);

create policy "public read notifications" on notifications for select using (true);
create policy "public insert notifications" on notifications for insert with check (true);
create policy "public update notifications" on notifications for update using (true);

create policy "public read experiences" on experiences for select using (true);
create policy "public insert experiences" on experiences for insert with check (true);
create policy "public delete experiences" on experiences for delete using (true);

create policy "public read rewards" on rewards for select using (true);
create policy "public insert rewards" on rewards for insert with check (true);
create policy "public delete rewards" on rewards for delete using (true);

create policy "public read staff" on staff_members for select using (true);
create policy "public insert staff" on staff_members for insert with check (true);
create policy "public update staff" on staff_members for update using (true);
create policy "public delete staff" on staff_members for delete using (true);
