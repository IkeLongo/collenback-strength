import { z } from 'zod'
 
export const SignupFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters long.' })
    .trim(),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters long.' })
    .trim(),
  phone: z
    .string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, { message: 'Phone number must be in format (xxx) xxx-xxxx.' })
    .trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
})
 
export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }).trim(),
})

export type FormState =
  | {
      status: 'error'
      errors?: {
        firstName?: string[]
        lastName?: string[]
        phone?: string[]
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | {
      status: 'success'
      message?: string
      errors?: never
    }
  | undefined

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
  role?: string; // Optional role field if needed
};
