import { auth } from '@/app/actions/nextauth';

export default async function ClientDashboard() {
  const session = await auth();
  const userName = session?.user?.firstName ? `${session.user.firstName}` : 'User';

  return (
    <div className="space-y-4! sm:space-y-6!">
      <div>
        <h1 className="text-xl! sm:text-2xl! font-bold! text-grey-600!">Welcome back, {userName}!</h1>
        <p className="text-grey-500! text-sm! sm:text-base!">Track your progress and manage your fitness journey.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3! sm:gap-4! md:gap-6!">
        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">Current Program</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-gold-600! mt-2!">Strength Building</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">Week 3 of 12</p>
        </div>
        
        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">Next Session</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-gold-600! mt-2!">Tomorrow</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">Upper Body Focus</p>
        </div>
        
        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow! sm:col-span-2 lg:col-span-1">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">Progress</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-gold-600! mt-2!">85%</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">Goal completion</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
        <h2 className="text-lg! sm:text-xl! font-semibold! text-grey-700! mb-3! sm:mb-4!">Recent Activity</h2>
        <div className="space-y-2! sm:space-y-3!">
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-2! border-b! border-grey-200!">
            <span className="text-grey-700! text-sm! sm:text-base!">Completed: Leg Day Workout</span>
            <span className="text-xs! sm:text-sm! text-grey-500! mt-1! sm:mt-0!">2 days ago</span>
          </div>
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-2! border-b! border-grey-200!">
            <span className="text-grey-700! text-sm! sm:text-base!">Updated: Nutrition Goals</span>
            <span className="text-xs! sm:text-sm! text-grey-500! mt-1! sm:mt-0!">1 week ago</span>
          </div>
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-2!">
            <span className="text-grey-700! text-sm! sm:text-base!">Scheduled: Check-in Session</span>
            <span className="text-xs! sm:text-sm! text-grey-500! mt-1! sm:mt-0!">Next week</span>
          </div>
        </div>
      </div>
    </div>
  );
}