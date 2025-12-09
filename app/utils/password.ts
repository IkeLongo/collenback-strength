import bcryptjs from 'bcryptjs';

/**
 * Hashes a password using bcryptjs without adding additional salting.
 * @param password - The plain text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function saltAndHashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Increase the number of salt rounds for better security
  return await bcryptjs.hash(password, saltRounds);
}
