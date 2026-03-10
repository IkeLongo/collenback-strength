import React from "react";
import "./ui-legal.css";

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  toc?: React.ReactNode;
};

export default function LegalPage({ title, lastUpdated, children, toc }: LegalPageProps) {
  return (
    <div className="legal bg-slate-50 min-h-screen flex justify-center">
      <div className="w-full max-w-[1020px] px-4 pt-28 pb-16">
        <header className="text-center py-8">
          <h1 className="text-slate-900">{title}</h1>
          <p className="text-slate-600">Last updated {lastUpdated}</p>
        </header>

        {toc ? <div className="mb-10">{toc}</div> : null}

        <main className="legal text-slate-900 bg-white rounded-2xl border border-slate-200 shadow-sm px-6 md:px-10 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}