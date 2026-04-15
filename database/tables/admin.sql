create table public.admin (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  email text not null,
  expiry_date date not null default now(),
  constraint admin_pkey primary key (id),
  constraint admin_email_key unique (email)
) TABLESPACE pg_default;