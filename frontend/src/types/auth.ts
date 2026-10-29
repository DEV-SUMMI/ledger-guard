export type Role = "user" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
