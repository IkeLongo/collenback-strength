import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { getUserByEmailWithRole, UserWithRole } from '@/app/lib/queries/users';

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: LoginRequestBody = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Find user by email and get their role through table joins
    const users = await getUserByEmailWithRole(email);

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check if user has a role assigned
    if (!user.role_id || !user.role_name) {
      return NextResponse.json(
        { message: 'User account is not properly configured. Please contact support.' },
        { status: 403 }
      );
    }

    // Determine redirect URL based on role
    let redirectUrl = '/dashboard'; // Default fallback
    
    switch (user.role_name.toLowerCase()) {
      case 'client':
        redirectUrl = '/client/dashboard';
        break;
      case 'coach':
        redirectUrl = '/coach/dashboard';
        break;
      case 'admin':
        redirectUrl = '/admin/dashboard';
        break;
      default:
        // Default to client dashboard for any unrecognized role
        redirectUrl = '/client/dashboard';
    }

    // Return success with user info and role details
    return NextResponse.json({
      message: 'Login successful',
      userId: user.id.toString(),
      role: user.role_name,
      roleId: user.role_id,
      redirectUrl: redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
