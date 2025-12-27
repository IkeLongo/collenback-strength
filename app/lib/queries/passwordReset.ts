import { pool } from "@/app/lib/mysql";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type PasswordResetTokenRow = RowDataPacket & {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date | string;
  used_at: Date | string | null;
  created_at: Date | string;
};

export async function createPasswordResetToken(params: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}) {
  const { userId, tokenHash, expiresAt } = params;

  // Optional: invalidate any previous unused tokens for this user
  await pool.execute<ResultSetHeader>(
    `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE user_id = ? AND used_at IS NULL
    `,
    [userId]
  );

  await pool.execute<ResultSetHeader>(
    `
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (?, ?, ?)
    `,
    [userId, tokenHash, expiresAt]
  );
}

export async function getValidPasswordResetTokenByHash(tokenHash: string) {
  const [rows] = await pool.execute<PasswordResetTokenRow[]>(
    `
    SELECT *
    FROM password_reset_tokens
    WHERE token_hash = ?
      AND used_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] ?? null;
}

export async function markPasswordResetTokenUsed(id: number) {
  await pool.execute<ResultSetHeader>(
    `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE id = ?
    `,
    [id]
  );
}

export async function updateUserPasswordHash(params: {
  userId: number;
  passwordHash: string;
}) {
  const { userId, passwordHash } = params;
  await pool.execute<ResultSetHeader>(
    `
    UPDATE users
    SET password_hash = ?, updated_at = NOW()
    WHERE id = ?
    `,
    [passwordHash, userId]
  );
}
