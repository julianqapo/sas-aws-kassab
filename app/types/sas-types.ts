export interface SASUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_id: number;
  enabled: number;
  
  expiration: string;
  balance: string;
  remaining_days: string;
  name: string;
  parent_username: string;
  last_online: string;
  daily_traffic_details: {traffic: string;};
  profile_details: {name: string;};
  manager_id: number;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface SASProfile {
  id: number;
  name: string;
}

export interface SASOnlineUser {
  id: number;
  username: string;
  nas_id: number;
  nas_ip: string;
  start_time: string;
  download: string;
  upload: string;
}
