"use client";

import React from "react";
import Link from "next/link";
import { Label } from "@/app/ui/components/form/label";
import { Input } from "@/app/ui/components/form/input";
import { cn } from "@/app/lib/utils";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [pending, setPending] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.message ?? "Something went wrong.");
        return;
      }

      // IMPORTANT: should always be generic success
      toast.success(
        data?.message ??
          "If an account exists for that email, a reset link has been sent."
      );

      setEmail("");
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-4 md:p-8 md:shadow-input">
        <h1 className="text-2xl! font-semibold! text-grey-700!">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm! text-grey-600!">
          Enter your email and we’ll send you a password reset link.
        </p>

        <form className="my-8 w-full" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-6">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              placeholder="example@gmail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-grey-700 to-grey-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:cursor-pointer disabled:opacity-60"
            type="submit"
            disabled={pending}
          >
            {pending ? "Sending..." : "Send reset link"} &rarr;
            <BottomGradient />
          </button>

          <div className="mt-6 text-center text-sm! text-grey-600!">
            <Link
              href="/auth"
              className="text-grey-700! !no-underline underline underline-offset-4"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-gold-600 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>
    {children}
  </div>
);
