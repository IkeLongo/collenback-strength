"use client";

import React, { createContext, useContext, useState } from "react";

type FormType = "login" | "signup";
interface AuthFormContextValue {
  formType: FormType;
  setFormType: (type: FormType) => void;
}

const AuthFormContext = createContext<AuthFormContextValue | undefined>(undefined);

export const useAuthForm = () => {
  const ctx = useContext(AuthFormContext);
  if (!ctx) throw new Error("useAuthForm must be used within AuthFormProvider");
  return ctx;
};

export const AuthFormProvider = ({ children }: { children: React.ReactNode }) => {
  const [formType, setFormType] = useState<FormType>("login");
  return (
    <AuthFormContext.Provider value={{ formType, setFormType }}>
      {children}
    </AuthFormContext.Provider>
  );
};