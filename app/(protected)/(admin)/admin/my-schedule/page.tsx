import { requireAdmin } from "@/app/lib/auth/requireAdmin";
import MyScheduleClient from "./my-schedule-client";

export default async function MySchedulePage() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return (
      <div className="rounded-2xl border border-grey-300 bg-white p-6 text-grey-700">
        Not authorized.
      </div>
    );
  }

  // Admin == Coach for now (you said only coach is also admin)
  const coachId = guard.userId;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl! font-semibold! text-grey-700! normal-case!">My Schedule</h1>
        <p className="text-sm! text-grey-500!">
          Set your weekly availability rules and one-off exceptions.
        </p>
      </div>

      <MyScheduleClient coachId={coachId} />
    </div>
  );
}