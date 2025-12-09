import { NextResponse } from 'next/server';
import pool from '@/app/lib/mysql';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
  const { firstName, lastName, email, hashedPassword } = await request.json();

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword]
    );

    const userId = result.insertId.toString(); // Convert userId to string

    if (!userId) {
      return NextResponse.json({
        message: 'An error occurred while creating your account.',
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User created successfully',
      userId,
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({
      message: 'An error occurred while creating your account.',
    }, { status: 500 });
  }
}
