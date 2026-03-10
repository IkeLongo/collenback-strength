"use client";

import React, { useEffect } from "react";
import { LoginForm } from "../../../components/layout/auth/login-form";
import { SignupForm } from "../../../components/layout/auth/signup-form";
import { useAuthForm } from "./auth-form-context";

export default function GetStartedClient() {
  const { formType, setFormType } = useAuthForm();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [formType]);

  return formType === "signup" ? (
    <SignupForm onShowLogin={() => setFormType("login")} />
  ) : (
    <LoginForm onShowSignup={() => setFormType("signup")} />
  );
}