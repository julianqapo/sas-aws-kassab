// --- ACCESS LIST MODEL ---
export interface AccessList {
  id: number; // smallint
  name: string; // text
}

// --- ADMIN MODEL ---
export interface Admin {
  id: string; // uuid
  created_at: string; // timestamptz (ISO string)
  email: string; // text
  expiry_date: string; // date (YYYY-MM-DD)
}

// --- CREDENTIAL MODEL ---
export interface Credential {
  id_admin: string; // uuid
  username: string; // text
  password: string; // text
}

// --- SALARY MODEL ---
export interface Salary {
  id: number; // bigint
  created_at: string; // timestamptz (ISO string)
  id_admin: string; // uuid (Foreign Key to Admin)
  by_uid: string; // uuid (Foreign Key to Staff)
  to_uid: string; // uuid (Foreign Key to Staff)
  amount: number; // numeric
  month: number; // smallint
  is_paid: boolean; // boolean
  paid_at: string | null; // date (YYYY-MM-DD) or null if not paid yet
}

// --- STAFF MODEL ---
export interface Staff {
  id: string; // uuid
  created_at: string; // timestamptz (ISO string)
  email: string; // text
  full_name: string; // text
  id_admin: string; // uuid (Foreign Key to Admin)
  is_active: boolean; // boolean
}