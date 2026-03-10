export type MembershipLineItem = {
  subscription_id: number;
  kind: "membership";
  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";
  db_active_flag: boolean;
  state: "active" | "expired";
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  sessions_per_period: number;
  sessions_used_period: number;
  sessions_available_period: number;
};

export type PackLineItem = {
  kind: "pack";
  pack_id: number;
  purchased_at: Date;
  status: "active" | "refunded" | "voided";
  expires_at: Date | null;
  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;
  total_credits: number;
  credits_used: number;
  credits_reserved: number;
  available_credits: number;
  payment_id: number;
  payment_item_id: number | null;
};

export type ProgramLineItem = {
  kind: "program";
  program_entitlement_id: number;
  purchased_at: Date;
  status: "active" | "refunded" | "voided";
  sanity_service_id: string | null;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;
  program_version: string | null;
  program_notes: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  sanity_file_asset_ref: string;
  payment_id: number;
  payment_item_id: number;
};

export type LineItem = PackLineItem | MembershipLineItem | ProgramLineItem;

export type PackSummaryRow = {
  sanity_service_id: string;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;
  purchases_count: number;
  total_credits: number;
  credits_used: number;
  credits_reserved: number;
  available_credits: number;
};

export type MembershipSummaryRow = {
  sanity_service_id: string;
  sanity_service_slug: string | null;
  service_title: string | null;
  service_category: string | null;
  memberships_count: number;
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
};

export type ClientDashboardEntitlements = {
  lineItems: LineItem[];
  packsSummary: PackSummaryRow[];
  membershipsSummary: MembershipSummaryRow[];
};

export type SanityService = {
  _id: string;
  title?: string;
  slug?: { current?: string } | string | null;
  category?: string | null;
  program?: {
    notes?: string | null;
    coverImageAlt?: string | null;
    coverImage?: any;
    coverImageUrl?: string | null;
  } | null;
};