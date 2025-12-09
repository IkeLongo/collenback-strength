"use server";

import { SignupFormSchema, LoginFormSchema, FormState } from '@/app/lib/definitions'
import { saltAndHashPassword } from '@/app/utils/password'
import { createSession, deleteSession } from '@/app/lib/session'
import { redirect } from 'next/navigation';

export async function signup(state: FormState, formData: FormData) {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      status: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Prepare data for insertion into database
  const { firstName, lastName, phone, email, password } = validatedFields.data;
  const hashedPassword = await saltAndHashPassword(password);

  let userId: string | undefined;

    // 3. Insert the user into the database
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // TO-DO: Update this to your site URL
    const response = await fetch(`${baseUrl}/api/insert_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, phone, email, hashedPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Check if it's a duplicate email error
      if (result.message && result.message.includes('Duplicate entry')) {
        return { 
          status: 'error', 
          errors: { email: ['This email address is already associated with an account.'] }
        };
      }
      return { status: 'error', message: result.message || 'An error occurred while creating your account.' };
    }

    if (!result.userId) {
      return { status: 'error', message: 'An error occurred while creating your account.' };
    }

    userId = result.userId;
    
    // 4. Create user session (separate try/catch block optional here)
    if (userId) {
      try {
        await createSession(userId);
      } catch (err) {
        console.error('Session Error:', err);
        return { status: 'error', message: 'User created, but session could not be started.' };
      }
    } else {
      return { status: 'error', message: 'User ID is undefined after insertion.' };
    }
    
  } catch (err) {
    console.error('Database Error during insert:', err);
    return { status: 'error', message: 'An error occurred while creating your account.' };
  }

  // 5. Success - redirect to client dashboard (outside try/catch)
  redirect('/client/dashboard');
}

export async function login(state: FormState, formData: FormData) {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      status: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  let redirectUrl = '/client/dashboard'; // Default fallback

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/login_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        status: 'error', 
        message: result.message || 'Invalid email or password.' 
      };
    }

    if (!result.userId) {
      return { 
        status: 'error', 
        message: 'Login failed. Please try again.' 
      };
    }

    // Get the role-based redirect URL from the API response
    if (result.redirectUrl) {
      redirectUrl = result.redirectUrl;
    }

    // Create user session
    try {
      await createSession(result.userId);
    } catch (err) {
      console.error('Session Error:', err);
      return { 
        status: 'error', 
        message: 'Login successful, but session could not be started.' 
      };
    }

  } catch (err) {
    console.error('Login Error:', err);
    return { 
      status: 'error', 
      message: 'An error occurred during login. Please try again.' 
    };
  }

  // Success - redirect based on user's role
  redirect(redirectUrl);
}

export async function logout() {
  deleteSession()
  redirect('/login')
}
