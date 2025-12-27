import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/mysql';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
  const { firstName, lastName, phone, email, hashedPassword } = await request.json();

  // Start a transaction to ensure both user and role are created together
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Insert the user
    const [userResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO users (first_name, last_name, phone, email, password_hash) VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, phone, email, hashedPassword]
    );

    const userId = userResult.insertId;

    if (!userId) {
      throw new Error('Failed to create user');
    }

    // 2. Assign client role (role_id = 1) to the new user
    await connection.execute<ResultSetHeader>(
      `INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (?, ?, NOW())`,
      [userId, 1] // role_id 1 = client
    );

    // Commit the transaction
    await connection.commit();

    return NextResponse.json({
      message: 'User created successfully and assigned client role',
      userId: userId.toString(),
    });
  } catch (error: any) {
    // Rollback the transaction on error
    await connection.rollback();
    // console.error('Database Error:', error);
    
    // Check for duplicate email error (MySQL error code 1062)
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return NextResponse.json({
        message: 'Duplicate entry - This email address is already associated with an account.',
      }, { status: 409 }); // 409 Conflict status code
    }
    
    return NextResponse.json({
      message: 'An error occurred while creating your account.',
    }, { status: 500 });
  } finally {
    // Release the connection
    connection.release();
  }
}
