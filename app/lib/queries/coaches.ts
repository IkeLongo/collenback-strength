import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/app/lib/mysql";

type CoachRow = RowDataPacket & {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
};

export async function getCoachContactById(coachId: number) {
  const [rows] = await pool.execute<CoachRow[]>(
    `
    SELECT u.id, u.first_name, u.last_name, u.email, u.phone
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    WHERE r.name = 'coach'
      AND u.is_active = 1
      AND u.id = ?
    LIMIT 1
    `,
    [coachId]
  );

  const coach = rows[0];
  if (!coach) return null;

  return {
    id: Number(coach.id),
    firstName: coach.first_name ?? "",
    lastName: coach.last_name ?? "",
    email: coach.email ?? "",
    phone: coach.phone ?? "",
    name: [coach.first_name, coach.last_name].filter(Boolean).join(" ").trim(),
  };
}
