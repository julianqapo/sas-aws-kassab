create table public.credential (
  id_admin uuid not null default auth.uid (),
  username text not null,
  password text not null,
  constraint credential_pkey primary key (id_admin),
  constraint credential_id_admin_fkey foreign KEY (id_admin) references admin (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;