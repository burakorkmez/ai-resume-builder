-- ponytail: one idempotent schema file applied by `npm run db:migrate`. Move to versioned migrations
-- (drizzle-kit, plan.md §4) the first time a table needs an ALTER.

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_subject text not null unique, -- Neon Auth user id, treated as opaque text
  plan text not null default 'free' check (plan in ('free', 'pro')),
  free_used int not null default 0 check (free_used >= 0),
  pro_used int not null default 0 check (pro_used >= 0),
  period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  ai_disclosure_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references app_users (id) on delete cascade,
  source_resume_id uuid references resumes (id) on delete set null,
  title text not null check (length(title) between 1 and 120),
  page_size text not null default 'A4' check (page_size in ('A4', 'LETTER')),
  document jsonb not null,
  job jsonb,
  suggestions jsonb not null default '[]',
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resumes_owner_updated on resumes (owner_id, updated_at desc);
