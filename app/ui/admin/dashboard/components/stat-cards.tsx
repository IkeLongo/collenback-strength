"use client";

import React from "react";
import type { DashboardStats } from "../dashboard-types";
import { cn } from "@/app/lib/utils";

type Props = {
  stats: DashboardStats;
};

function formatMoneyCents(cents: number) {
  const dollars = (cents ?? 0) / 100;
  return dollars.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-grey-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-grey-600">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-grey-900">{value}</div>
      {helper ? (
        <div className="mt-1 text-sm text-grey-600">{helper}</div>
      ) : null}
    </div>
  );
}

export function StatsCards({ stats }: Props) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4")}>
      <StatCard
        label="Upcoming sessions"
        value={String(stats.upcomingSessionsCount ?? 0)}
        helper="Scheduled from today forward"
      />
      <StatCard
        label="Active clients"
        value={String(stats.activeClientsCount ?? 0)}
        helper="Unique clients in ±30 days"
      />
      <StatCard
        label="Revenue this month"
        value={formatMoneyCents(stats.revenueThisMonthCents ?? 0)}
        helper="Succeeded payments (month-to-date)"
      />
      <StatCard
        label="Booked (last 30 days)"
        value={String(stats.sessionsBooked30dCount ?? 0)}
        helper="Sessions created/booked in last 30 days"
      />
    </div>
  );
}
