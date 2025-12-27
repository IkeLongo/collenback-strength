import { auth } from '@/app/actions/nextauth';

export default async function CoachingDashboard() {
  const session = await auth();
  const userName = session?.user?.firstName ? `${session.user.firstName}` : 'Coach';

  return (
    <div className="space-y-4! sm:space-y-6!">
      <div>
        <h1 className="text-xl! sm:text-2xl! font-bold! text-grey-600!">Welcome back, {userName}!</h1>
        <p className="text-grey-500! text-sm! sm:text-base!">Manage your clients and coaching programs.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3! sm:gap-4! md:gap-6!">
        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">Active Clients</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-gold-600! mt-2!">24</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">+3 this week</p>
        </div>
        
        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">Sessions Today</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-gold-600! mt-2!">6</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">2 remaining</p>
        </div>
        
        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow! sm:col-span-2 lg:col-span-1">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">This Month</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-gold-600! mt-2!">$5,200</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">+12% from last month</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
        <h2 className="text-lg! sm:text-xl! font-semibold! text-grey-700! mb-3! sm:mb-4!">Today's Schedule</h2>
        <div className="space-y-2! sm:space-y-3!">
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-3! bg-grey-50! rounded-lg! px-4!">
            <div>
              <span className="text-grey-700! text-sm! sm:text-base! font-medium!">Sarah Johnson - Strength Training</span>
              <p className="text-xs! sm:text-sm! text-grey-600!">9:00 AM - 10:00 AM</p>
            </div>
            <span className="text-xs! sm:text-sm! text-grey-700! bg-grey-200! px-2! py-1! rounded! mt-2! sm:mt-0!">Upcoming</span>
          </div>
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-3! bg-grey-50! rounded-lg! px-4!">
            <div>
              <span className="text-grey-700! text-sm! sm:text-base! font-medium!">Mike Davis - Cardio Session</span>
              <p className="text-xs! sm:text-sm! text-grey-600!">11:00 AM - 12:00 PM</p>
            </div>
            <span className="text-xs! sm:text-sm! text-grey-700! bg-grey-200! px-2! py-1! rounded! mt-2! sm:mt-0!">Scheduled</span>
          </div>
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-3! bg-grey-50! rounded-lg! px-4!">
            <div>
              <span className="text-grey-700! text-sm! sm:text-base! font-medium!">Emily Chen - Personal Training</span>
              <p className="text-xs! sm:text-sm! text-grey-600!">2:00 PM - 3:00 PM</p>
            </div>
            <span className="text-xs! sm:text-sm! text-grey-700! bg-grey-200! px-2! py-1! rounded! mt-2! sm:mt-0!">Scheduled</span>
          </div>
        </div>
      </div>

      {/* Recent Client Activity */}
      <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
        <h2 className="text-lg! sm:text-xl! font-semibold! text-grey-700! mb-3! sm:mb-4!">Recent Client Activity</h2>
        <div className="space-y-2! sm:space-y-3!">
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-2! border-b! border-grey-200!">
            <span className="text-grey-700! text-sm! sm:text-base!">Sarah Johnson completed: Upper Body Workout</span>
            <span className="text-xs! sm:text-sm! text-grey-500! mt-1! sm:mt-0!">1 hour ago</span>
          </div>
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-2! border-b! border-grey-200!">
            <span className="text-grey-700! text-sm! sm:text-base!">Mike Davis updated nutrition log</span>
            <span className="text-xs! sm:text-sm! text-grey-500! mt-1! sm:mt-0!">3 hours ago</span>
          </div>
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-2!">
            <span className="text-grey-700! text-sm! sm:text-base!">New client registration: Alex Thompson</span>
            <span className="text-xs! sm:text-sm! text-grey-500! mt-1! sm:mt-0!">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
}