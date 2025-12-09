import pool from '@/app/lib/mysql';
import { RowDataPacket } from 'mysql2';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string;
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
export async function getUserByEmailWithRole(email: string): Promise<UserWithRole[]> {
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
    WHERE u.email = ?`,
    [email]
  );

  return rows as UserWithRole[];
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