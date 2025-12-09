export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-grey-700">Welcome back!</h1>
        <p className="text-grey-600">Track your progress and manage your fitness journey.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-grey-700">Current Program</h3>
          <p className="text-2xl font-bold text-gold-600 mt-2">Strength Building</p>
          <p className="text-sm text-grey-500">Week 3 of 12</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-grey-700">Next Session</h3>
          <p className="text-2xl font-bold text-gold-600 mt-2">Tomorrow</p>
          <p className="text-sm text-grey-500">Upper Body Focus</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-grey-700">Progress</h3>
          <p className="text-2xl font-bold text-gold-600 mt-2">85%</p>
          <p className="text-sm text-grey-500">Goal completion</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-grey-700 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-grey-200">
            <span className="text-grey-700">Completed: Leg Day Workout</span>
            <span className="text-sm text-grey-500">2 days ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-grey-200">
            <span className="text-grey-700">Updated: Nutrition Goals</span>
            <span className="text-sm text-grey-500">1 week ago</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-grey-700">Scheduled: Check-in Session</span>
            <span className="text-sm text-grey-500">Next week</span>
          </div>
        </div>
      </div>
    </div>
  );
}