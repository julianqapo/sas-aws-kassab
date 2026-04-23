create table public.activation_password (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  updated_at timestamp with time zone null,
  password text not null,
  email text not null default auth.email (),
  id_admin uuid not null,
  constraint activation_password_pkey primary key (id),
  constraint activation_password_id_admin_fkey foreign KEY (id_admin) references admin (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;