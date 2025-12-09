'use client'

import React from 'react';
import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'
import { Label } from "@/app/ui/components/form/label";
import { Input } from "@/app/ui/components/form/input";
import { PhoneInput } from "@/app/ui/components/form/phone-input";
import { cn } from "@/app/lib/utils";
import { toast } from 'react-toastify';
import {
  IconBrandGoogle,
  IconBrandX,
  IconBrandFacebook,
} from "@tabler/icons-react";
		
export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)
  
  // Form state management
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    phone: '',
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

  // Handle success/error with useEffect since server actions redirect automatically
  React.useEffect(() => {
    if (state?.status === 'success') {
      // Clear form data on success
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: ''
      });
      
      toast.success(state.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "bg-gray-900",
      });
    } else if (state?.status === 'error' && state.message) {
      toast.error(state.message);
      // Don't clear form data on error - keep user's input
    }
  }, [state]);

  return (
        <div className="mx-auto w-full max-w-md rounded-t-[50px] md:rounded-2xl bg-white p-4 md:p-8 relative flex flex-col h-full items-center justify-start md:justify-center z-2 pt-0 md:pt-8 md:py-10 md:shadow-input">

          <form className="my-8 w-full" action={action}>
            <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <LabelInputContainer>
                <Label htmlFor="firstName">First name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  placeholder="First Name" 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required 
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastName">Last name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  placeholder="Last Name" 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required 
                />
              </LabelInputContainer>
            </div>
            {state?.errors?.firstName && <p className="!text-red-500 !text-sm mb-4">{state.errors.firstName}</p>}
            {state?.errors?.lastName && <p className="!text-red-500 !text-sm mb-4">{state.errors.lastName}</p>}

            <LabelInputContainer className="mb-4">
              <Label htmlFor="phone">Phone Number</Label>
              <PhoneInput 
                id="phone" 
                name="phone" 
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                required 
              />
            </LabelInputContainer>
            {state?.errors?.phone && <p className="!text-red-500 !text-sm mb-4">{state.errors.phone}</p>}

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
            {state?.errors?.email && <p className="!text-red-500 !text-sm mb-4">{state.errors.email}</p>}
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
            {state?.errors?.password && (
              <div>
                <p className='!text-red-500 !text-left !mb-2'>Password must:</p>
                <ul>
                  {state.errors.password.map((error) => (
                    <li key={error} className='!text-red-500 !text-sm font-medium'>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-grey-700 to-grey-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:cursor-pointer"
              type="submit"
              disabled={pending}
            >
              Sign Up &rarr;
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
          
          <p className="!text-gray-700 pt-4 !text-[15px]">
            Already have an account? <a href="/login" className="!text-gold-600 hover:!text-gold-500 !no-underline !text-[18px]">Login</a>
          </p>
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