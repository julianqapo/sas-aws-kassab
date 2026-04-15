create table public.staff (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  email text not null,
  full_name text not null,
  id_admin uuid not null,
  is_active boolean not null default true,
  constraint staff_pkey primary key (id),
  constraint staff_email_key unique (email),
  constraint staff_id_admin_fkey foreign KEY (id_admin) references admin (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;