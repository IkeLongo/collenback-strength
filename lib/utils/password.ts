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

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password to compare.
 * @param hashedPassword - The hashed password to compare against.
 * @returns A promise that resolves to true if the passwords match, or false otherwise.
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcryptjs.compare(password, hashedPassword);
}
