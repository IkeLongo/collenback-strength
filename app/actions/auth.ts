"use server";

import { SignupFormSchema, FormState } from '@/app/lib/definitions'
import { saltAndHashPassword } from '@/app/utils/password'

export async function signup(state: FormState, formData: FormData) {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
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
  const { firstName, lastName, email, password } = validatedFields.data;
  const hashedPassword = await saltAndHashPassword(password);

  let userId: string | undefined;

    // 3. Insert the user into the database
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // TO-DO: Update this to your site URL
    const response = await fetch(`${baseUrl}/api/insert_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, hashedPassword }),
    });

    const result = await response.json();

    if (!response.ok || !result.userId) {
      return { status: 'error', message: 'An error occurred while creating your account.' };
    }

    userId = result.userId;
  } catch (err) {
    console.error('Database Error during insert:', err);
    return { status: 'error', message: 'An error occurred while creating your account.' };
  }
}
