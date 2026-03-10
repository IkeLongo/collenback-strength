// app/ui/admin/dashboard/dashboard-types.ts

export type MoneyCents = number;

export type DashboardStats = {
  upcomingSessionsCount: number;
  activeClientsCount: number;
  revenueThisMonthCents: number;
  sessionsBooked30dCount: number;
};

export type SessionStatus = "scheduled" | "completed" | "canceled" | "no_show";

export type SessionListItem = {
  id: string;

  clientUserId: number;
  coachId: number;

  scheduledStartUtc: string;
  scheduledEndUtc: string;

  location: string | null;

  // from DB
  sanityServiceId: string | null;
  sanityServiceSlug: string | null;

  // hydrated from Sanity
  serviceTitle: string | null;

  // optional later
  clientName: string | null;
};

export type ActivityKind =
  | "session_booked"
  | "session_completed"
  | "session_canceled"
  | "purchase_completed"
  | "refund_issued"
  | "credits_granted";

export type ActivityItem = {
  id: string;
  kind: "session_booked" | "session_canceled" | "purchase_completed";
  title: string;
  description?: string;
  occurredAtUtc: string;
  href?: string;
};

export type DashboardData = {
  stats: DashboardStats;
  upcomingSessions: SessionListItem[];
  recentActivity: ActivityItem[];
};
