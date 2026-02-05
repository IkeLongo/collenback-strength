// app/actions/auth.ts

"use server";

import { SignupFormSchema, LoginFormSchema, FormState } from '@/app/lib/definitions'
import { saltAndHashPassword } from '@/app/utils/password'
import { deleteSession } from '@/app/lib/session'
import { redirect } from 'next/navigation';

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
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
      status: 'error' as const,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Prepare data for insertion into database
  const { firstName, lastName, phone, email, password } = validatedFields.data;
  const hashedPassword = await saltAndHashPassword(password);

  let userId: string | undefined;

    // 3. Insert the user into the database
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'; // TO-DO: Update this to your site URL
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
          status: 'error' as const, 
          errors: { email: ['This email address is already associated with an account.'] }
        };
      }
      return { status: 'error' as const, message: result.message || 'An error occurred while creating your account.' };
    }

    if (!result.userId) {
      return { status: 'error' as const, message: 'An error occurred while creating your account.' };
    }

    userId = result.userId;
    
    // 4. User created successfully - NextAuth will handle the session
    
  } catch (err) {
    // console.error('Database Error during insert:', err);
    return { status: 'error' as const, message: 'An error occurred while creating your account.' };
  }

  // 5. Success - return success status (client-side will handle NextAuth login)
  return { 
    status: 'success' as const, 
    message: 'Account created successfully! Logging you in...' 
  };
}

export async function logout() {
  deleteSession()
  redirect('/auth')
}
