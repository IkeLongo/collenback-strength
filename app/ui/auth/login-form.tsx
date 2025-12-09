'use client'

import React from 'react';
import { signIn, getSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Label } from "@/app/ui/components/form/label";
import { Input } from "@/app/ui/components/form/input";
import { cn } from "@/app/lib/utils";
import { toast } from 'react-toastify';
import {
  IconBrandGoogle,
  IconBrandX,
  IconBrandFacebook,
} from "@tabler/icons-react";
		
// Helper function to determine dashboard URL based on user role
const getDashboardUrl = (role: string | undefined): string => {
  if (!role) return '/client/dashboard'; // Default fallback
  
  switch (role.toLowerCase()) {
    case 'client':
      return '/client/dashboard';
    case 'coach':
      return '/coach/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/client/dashboard'; // Default to client dashboard
  }
};

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  
  // Form state management
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });

  // Handle input changes
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission with NextAuth signIn
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast.error(result.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "bg-gray-900",
        });
        // Don't clear form data on error - keep user's input
      } else {
        // Clear form data on success
        setFormData({
          email: '',
          password: ''
        });
        
        toast.success('Sign-in successful!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "bg-gray-900",
        });
        
        // Get the updated session and redirect based on user role
        const session = await getSession();
        const redirectUrl = getDashboardUrl(session?.user?.role);
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      toast.error('An unexpected error occurred.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "bg-gray-900",
      });
    } finally {
      setPending(false);
    }
  };


  return (
    <div className="mx-auto w-full max-w-md rounded-t-[50px] md:rounded-2xl bg-white p-4 md:p-8 relative flex flex-col h-full items-center justify-start md:justify-center z-2 pt-0 md:pt-8 md:py-10 md:shadow-input">
      <form className="my-8 w-full" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            name="email" 
            placeholder="example@gmail.com" 
            type="email" 
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required 
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-8">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            name="password" 
            placeholder="••••••••" 
            type="password" 
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required 
          />
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-grey-700 to-grey-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:cursor-pointer"
          type="submit"
          disabled={pending}
        >
          {pending ? 'Signing In...' : 'Sign In'} &rarr;
          <BottomGradient />
        </button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-grey-300 to-transparent" />
        
        <div className="flex flex-col space-y-4">
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-grey-100 px-4 font-medium text-grey-700 border border-grey-300"
            type="button"
          >
            <IconBrandGoogle className="h-4 w-4 text-grey-600" />
            <span className="!text-sm text-grey-600">
              Google
            </span>
            <BottomGradient />
          </button>
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-grey-100 px-4 font-medium text-grey-700 border border-grey-300"
            type="button"
          >
            <IconBrandFacebook className="h-4 w-4 text-grey-600" />
            <span className="!text-sm text-grey-600">
              Facebook
            </span>
            <BottomGradient />
          </button>
          <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-grey-100 px-4 font-medium text-grey-700 border border-grey-300"
            type="button"
          >
            <IconBrandX className="h-4 w-4 text-grey-600" />
            <span className="!text-sm text-grey-600">
              X (Twitter)
            </span>
            <BottomGradient />
          </button>
        </div>
      </form>
      
      <div className="flex flex-col items-center space-y-2">
        <a 
          href="/forgot-password" 
          className="!text-grey-600 hover:!text-grey-800 !no-underline !text-sm"
        >
          Forgot your password?
        </a>
        <p className="!text-gray-700 !text-[15px]">
          Don't have an account? <a href="/signup" className="!text-gold-600 hover:!text-gold-500 !no-underline !text-[18px]">Sign up</a>
        </p>
      </div>
    </div>
  )
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-gold-600 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
