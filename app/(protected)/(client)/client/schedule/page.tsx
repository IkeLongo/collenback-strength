import CalendarBooking from "@/app/ui/schedule/calendar-booking";

export default function SchedulePage() {
  // Replace with real values from auth
  const coachId = 17;
  const clientId = 123;

  return (
    <div className="p-6">
      <CalendarBooking coachId={coachId} clientId={clientId} />
    </div>
  );
}
