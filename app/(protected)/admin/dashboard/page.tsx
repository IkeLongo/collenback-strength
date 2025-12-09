import { auth } from '@/app/actions/nextauth';

export default async function AdminDashboard() {
  const session = await auth();
  const userName = session?.user?.firstName ? `${session.user.firstName}` : 'Admin';

  return (
    <div className="space-y-4! sm:space-y-6! overflow-x-hidden">
      <div>
        <h1 className="text-xl! sm:text-2xl! font-bold! text-grey-600!">Welcome back, {userName}!</h1>
        <p className="text-grey-500! text-sm! sm:text-base!">Manage users, coaches, and system settings.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3! sm:gap-4! md:gap-6!">
        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">Total Users</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-gold-600! mt-2!">156</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">+12 this month</p>
        </div>
        
        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">Active Coaches</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-gold-600! mt-2!">8</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">2 pending approval</p>
        </div>
        
        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">Monthly Revenue</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-gold-600! mt-2!">$12,450</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">+8.5% from last month</p>
        </div>

        <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow! sm:col-span-2 lg:col-span-1">
          <h3 className="text-base! sm:text-lg! font-bold! text-grey-700! tracking-wide!">System Status</h3>
          <p className="text-xl! sm:text-2xl! font-bold! text-green-600! mt-2!">Online</p>
          <p className="text-xs! sm:text-sm! text-grey-500!">99.9% uptime</p>
        </div>
      </div>

      {/* Recent Admin Activity */}
      <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
        <h2 className="text-lg! sm:text-xl! font-semibold! text-grey-700! mb-3! sm:mb-4!">Recent Activity</h2>
        <div className="space-y-2! sm:space-y-3!">
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-2! border-b! border-grey-200!">
            <span className="text-grey-700! text-sm! sm:text-base!">New coach registration: Sarah Mitchell</span>
            <span className="text-xs! sm:text-sm! text-grey-500! mt-1! sm:mt-0!">2 hours ago</span>
          </div>
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-2! border-b! border-grey-200!">
            <span className="text-grey-700! text-sm! sm:text-base!">System backup completed successfully</span>
            <span className="text-xs! sm:text-sm! text-grey-500! mt-1! sm:mt-0!">Yesterday</span>
          </div>
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-2!">
            <span className="text-grey-700! text-sm! sm:text-base!">Updated user permissions for Premium tier</span>
            <span className="text-xs! sm:text-sm! text-grey-500! mt-1! sm:mt-0!">2 days ago</span>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-white! p-4! sm:p-6! rounded-lg! shadow!">
        <h2 className="text-lg! sm:text-xl! font-semibold! text-grey-700! mb-3! sm:mb-4!">Pending Actions</h2>
        <div className="space-y-2! sm:space-y-3!">
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-3! bg-red-50! rounded-lg! px-4!">
            <div>
              <span className="text-grey-700! text-sm! sm:text-base! font-medium!">Coach Application Review</span>
              <p className="text-xs! sm:text-sm! text-grey-600!">John Davis - Strength & Conditioning Specialist</p>
            </div>
            <span className="text-xs! sm:text-sm! text-red-700! bg-red-200! px-2! py-1! rounded! mt-2! sm:mt-0!">Urgent</span>
          </div>
          <div className="flex! flex-col! sm:flex-row! sm:justify-between! sm:items-center! py-3! bg-yellow-50! rounded-lg! px-4!">
            <div>
              <span className="text-grey-700! text-sm! sm:text-base! font-medium!">System Update Available</span>
              <p className="text-xs! sm:text-sm! text-grey-600!">Version 2.1.4 - Security patches included</p>
            </div>
            <span className="text-xs! sm:text-sm! text-yellow-700! bg-yellow-200! px-2! py-1! rounded! mt-2! sm:mt-0!">Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
}