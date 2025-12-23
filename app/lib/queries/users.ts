import { pool } from '@/app/lib/mysql';
import { RowDataPacket } from 'mysql2';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_key?: string | null;
}

export interface UserWithRole extends User {
  role_id: number;
  role_name: string;
  role_description: string;
}

/**
 * Get user by email with their role information
 * @param email - User's email address
 * @returns Promise<UserWithRole[]> - Array of users (should be 0 or 1)
 */
export async function getUserByEmailWithRoles(email: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
      u.id,
      u.email,
      u.password_hash,
      u.first_name,
      u.last_name,
      u.phone,
      u.avatar_key,

      GROUP_CONCAT(DISTINCT r.name ORDER BY r.id) AS roles,
      GROUP_CONCAT(DISTINCT r.id ORDER BY r.id)   AS role_ids,

      -- pick a deterministic primary role
      CASE
        WHEN SUM(r.name = 'admin') > 0 THEN 'admin'
        WHEN SUM(r.name = 'coach') > 0 THEN 'coach'
        ELSE 'client'
      END AS primary_role,

      CASE
        WHEN SUM(r.id = 3) > 0 THEN 3
        WHEN SUM(r.name = 'coach') > 0 THEN MIN(CASE WHEN r.name='coach' THEN r.id END)
        ELSE MIN(CASE WHEN r.name='client' THEN r.id END)
      END AS primary_role_id

    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    WHERE u.email = ?
    GROUP BY u.id
    `,
    [email]
  );

  return rows[0] ?? null;
}


/**
 * Get user by ID
 * @param id - User's ID
 * @returns Promise<User[]> - Array of users (should be 0 or 1)
 */
export async function getUserById(id: number): Promise<User[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, email, password_hash, first_name, last_name, phone FROM users WHERE id = ?',
    [id]
  );

  return rows as User[];
}

/**
 * Get user by ID with their role information
 * @param id - User's ID
 * @returns Promise<UserWithRole[]> - Array of users (should be 0 or 1)
 */
export async function getUserByIdWithRole(id: number): Promise<UserWithRole[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 
      u.id, 
      u.email, 
      u.password_hash, 
      u.first_name, 
      u.last_name, 
      u.phone,
      ur.role_id,
      r.name as role_name,
      r.description as role_description
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.id = ?`,
    [id]
  );

  return rows as UserWithRole[];
}

/**
 * Get user by email (without role information)
 * @param email - User's email address
 * @returns Promise<User[]> - Array of users (should be 0 or 1)
 */
export async function getUserByEmail(email: string): Promise<User[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, email, password_hash, first_name, last_name, phone FROM users WHERE email = ?',
    [email]
  );

  return rows as User[];
}