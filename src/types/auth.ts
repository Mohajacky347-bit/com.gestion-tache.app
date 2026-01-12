export type AppUserRole = "chef_section" | "chef_brigade";

export interface AuthUser {
  id: string;
  name: string;
  role: AppUserRole;
  email?: string;
  contact?: string;
  brigadeId?: number | null;
  brigadeName?: string | null;
}



