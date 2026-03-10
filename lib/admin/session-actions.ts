import { toast } from "react-toastify";

/**
 * Cancel a session as admin.
 * Calls the cancel API endpoint and shows appropriate toast notifications.
 */
export async function cancelSessionByAdmin(sessionId: number, reason = "Cancelled by admin") {
  const toastId = toast.loading("Canceling session...");
  try {
    const res = await fetch(`/api/sessions/${sessionId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.detail || data?.error || "Cancel failed");
    }
    toast.update(toastId, {
      render:
        data.policy === "release"
          ? "Session cancelled. Your credit was released."
          : "Session cancelled. Cancellation was within 24 hours, so the credit was consumed.",
      type: "success",
      isLoading: false,
      autoClose: 3500,
    });
    return data;
  } catch (e: any) {
    toast.update(toastId, {
      render: e?.message ?? "Failed to cancel session",
      type: "error",
      isLoading: false,
      autoClose: 4500,
    });
    throw e;
  }
}

/**
 * Mark a session as no-show as admin.
 * Calls the no-show API endpoint and shows appropriate toast notifications.
 */
export async function markNoShowByAdmin(sessionId: number, reason = "Client did not show up for scheduled session") {
  const toastId = toast.loading("Marking as no-show...");
  try {
    const res = await fetch(`/api/sessions/${sessionId}/no-show`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.detail || data?.error || "No-show marking failed");
    }
    toast.update(toastId, {
      render: "Session marked as no-show. Credit has been consumed.",
      type: "success",
      isLoading: false,
      autoClose: 3500,
    });
    return data;
  } catch (e: any) {
    toast.update(toastId, {
      render: e?.message ?? "Failed to mark session as no-show",
      type: "error",
      isLoading: false,
      autoClose: 4500,
    });
    throw e;
  }
}

/**
 * Mark a session as complete as admin.
 * Calls the complete API endpoint and shows appropriate toast notifications.
 */
export async function completeSessionByAdmin(sessionId: number) {
  const toastId = toast.loading("Marking session as complete...");
  try {
    const res = await fetch(`/api/sessions/${sessionId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.detail || data?.error || "Completion failed");
    }
    toast.update(toastId, {
      render: "Session marked as complete. Credit has been consumed.",
      type: "success",
      isLoading: false,
      autoClose: 3500,
    });
    return data;
  } catch (e: any) {
    toast.update(toastId, {
      render: e?.message ?? "Failed to mark session as complete",
      type: "error",
      isLoading: false,
      autoClose: 4500,
    });
    throw e;
  }
}
