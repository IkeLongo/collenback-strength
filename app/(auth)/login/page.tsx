import { LoginForm } from "@/app/ui/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <div className="mt-10">
        <div className="bg-white rounded-lg p-6 pt-0 md:pt-20">
          <LoginForm />
        </div>
      </div>
    </>
  );
}