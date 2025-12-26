"use client";

import React from "react";
import type { DashboardData } from "./dashboard-types";
import { StatsCards } from "./components/stat-cards";
import { RecentActivity } from "./components/recent-activity";
import { UpcomingSessions } from "./components/upcoming-sessions";

type AdminDashboardProps = {
  data: DashboardData;
};

export default function AdminDashboard({ data }: AdminDashboardProps) {
  console.log("recentActivity", data.recentActivity);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl! font-semibold! text-grey-700! normal-case!">Admin Dashboard</h1>
        <p className="text-sm! text-grey-500!">
          Review key metrics and recent activity on your coaching platform.
        </p>
      </div>
      <StatsCards stats={data.stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <UpcomingSessions sessions={data.upcomingSessions} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity items={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
