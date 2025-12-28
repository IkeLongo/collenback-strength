import bcryptjs from "bcryptjs";
import { getUserByEmailWithRoles } from "@/app/lib/queries/users";

export async function verifyCredentials(email: string, password: string) {
  const user = await getUserByEmailWithRoles(email);
  if (!user) return null;

  const ok = await bcryptjs.compare(password, user.password_hash);
  if (!ok) return null;

  const roles = user.roles ? String(user.roles).split(",") : [];
  const roleIds = user.role_ids ? String(user.role_ids).split(",").map(Number) : [];

  return {
    id: String(user.id),
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    avatarKey: user.avatar_key ?? null,
    role: user.primary_role,
    roleId: Number(user.primary_role_id),
    roles,
    roleIds,
  };
}
