import { useAuth } from "hooks/use-auth";

export function hasPermission(permission: string): boolean {
  const auth = useAuth();

  if (!auth.user) return false;

  if (permission in auth.user.permissions) return true;

  const parts = permission.split(".");

  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i] + ".*" in auth.user.permissions) return true;
  }

  return false;
}
