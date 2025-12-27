
import "react-toastify/dist/ReactToastify.css";
import { Suspense } from "react";
import AuthLayoutClient from "./auth-layout-client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AuthLayoutClient>{children}</AuthLayoutClient>
    </Suspense>
  );
}
