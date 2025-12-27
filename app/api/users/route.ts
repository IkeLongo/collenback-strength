import { NextResponse } from 'next/server';
import { pool } from "@/app/lib/mysql"; // Ensure you have the correct import for your database pool

export async function GET() {
  try {
    // console.log("testing connection to database:", process.env.DB_SCHEMA);
    
// Simple connection test - just check if we can connect to the database
    const [rows] = await pool.execute('SELECT 1 as connection_test');

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      database: process.env.DB_SCHEMA,
      result: rows
    });
  } catch (error) {
    // console.error('Database Connection Error:', error);

    // Type assertion to ensure error is treated as an Error object
    const errorMessage = (error as Error).message || 'Unknown error';

    return NextResponse.json({ 
      success: false,
      error: 'Database connection failed', 
      details: errorMessage 
    }, { status: 500 });
  }
}
