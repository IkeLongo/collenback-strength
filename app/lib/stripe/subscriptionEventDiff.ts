import type Stripe from "stripe";
import type { MembershipStatusKind } from "@/app/lib/email/sendMembershipStatusEmail";

export function inferMembershipNotificationFromSubEvent(
  event: Stripe.Event,
  sub: Stripe.Subscription
): MembershipStatusKind | null {
  const prev = (event.data as any).previous_attributes || {};

  // cancel scheduled toggle
  if (typeof prev.cancel_at_period_end === "boolean") {
    if (prev.cancel_at_period_end === false && sub.cancel_at_period_end === true) {
      return "cancel_scheduled";
    }
    if (prev.cancel_at_period_end === true && sub.cancel_at_period_end === false) {
      return "cancel_removed";
    }
  }

  // status transitions
  if (typeof prev.status === "string" && prev.status !== sub.status) {
    // common “canceled” terminal
    if (sub.status === "canceled") return "canceled";

    // “renewed” / “reactivated” (trialing/active)
    if (sub.status === "active" || sub.status === "trialing") return "renewed";
  }

  return null;
}
