'use client'

import React from "react";
import { signup } from "@/app/actions/auth";
import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Label } from "@/app/ui/components/form/label";
import { Input } from "@/app/ui/components/form/input";
import { PhoneInput } from "@/app/ui/components/form/phone-input";
import { cn } from "@/app/lib/utils";
import { toast } from "react-toastify";
import {
  IconBrandGoogle,
  IconBrandX,
  IconBrandFacebook,
} from "@tabler/icons-react";
		
export function SignupForm({ onShowLogin }: { onShowLogin: () => void }) {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");

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

  // Handle success/error with useEffect
  React.useEffect(() => {
    if (state?.status !== "success") return;

    toast.success(state.message || "Account created successfully!", {
      position: "top-right",
      autoClose: 1500,
      className: "bg-gray-900",
    });

    // ✅ Same redirect logic as login
    const callbackUrl = serviceId
      ? `/client/checkout?serviceId=${encodeURIComponent(serviceId)}`
      : "/client/dashboard";

    // Capture credentials before we clear state (avoid races)
    const { email, password } = formData;

    // Optional: clear UI fields (doesn't affect variables above)
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
    });

    // ✅ Let NextAuth redirect for us (no setTimeout / window.location)
    // IMPORTANT: this will navigate away, so no code after matters.
    signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl,
    });
  }, [state?.status, state?.message, serviceId]); // 👈 intentionally NOT depending on formData

  React.useEffect(() => {
    if (state?.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state?.status, state?.message]);

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
              className={cn(
                "group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-grey-700 to-grey-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:cursor-pointer",
                pending ? "opacity-90 cursor-not-allowed" : ""
              )}
              type="submit"
              disabled={pending}
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>

                  <span className="flex items-center">
                    Creating account
                    <span className="ml-1 flex">
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
                        .
                      </span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
                        .
                      </span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
                        .
                      </span>
                    </span>
                  </span>
                </span>
              ) : (
                <>
                  Sign Up &rarr;
                  <BottomGradient />
                </>
              )}

              {!pending && <BottomGradient />}
            </button>

            <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-grey-300 to-transparent" />
            {/* <div className="flex flex-col space-y-4">
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
            </div> */}
          </form>
          
          <p className="!text-gray-700 !text-[15px]">
            Already have an account?{' '}
            <span
              className="!text-gold-600 hover:!text-gold-500 !no-underline !text-[18px] cursor-pointer underline"
              onClick={onShowLogin}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onShowLogin(); }}
            >
              Login
            </span>
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