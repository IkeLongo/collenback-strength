import { SignupForm } from "@/app/ui/auth/signup-form";

export default function SignupPage() {
  return (
    <>
      <div className="mt-10">
        <div className="bg-white rounded-lg p-6 pt-0 md:pt-20">
          <SignupForm />
        </div>
      </div>
    </>
  );
}