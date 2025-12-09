export default function CoachingDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-grey-700">Coaching Portal</h1>
        <p className="text-grey-600">Manage your clients and coaching programs.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-grey-700">Active Clients</h3>
          <p className="text-3xl font-bold text-gold-600 mt-2">24</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-grey-700">Sessions Today</h3>
          <p className="text-3xl font-bold text-gold-600 mt-2">6</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-grey-700">This Month</h3>
          <p className="text-3xl font-bold text-gold-600 mt-2">$5,200</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-grey-700">Programs</h3>
          <p className="text-3xl font-bold text-gold-600 mt-2">12</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-grey-700 mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gold-100 rounded-lg">
            <div>
              <span className="font-medium text-grey-700">Sarah Johnson - Strength Training</span>
              <p className="text-sm text-grey-600">9:00 AM - 10:00 AM</p>
            </div>
            <span className="text-sm text-gold-700 bg-gold-200 px-2 py-1 rounded">Upcoming</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-grey-100 rounded-lg">
            <div>
              <span className="font-medium text-grey-700">Mike Davis - Cardio Session</span>
              <p className="text-sm text-grey-600">11:00 AM - 12:00 PM</p>
            </div>
            <span className="text-sm text-grey-700 bg-grey-200 px-2 py-1 rounded">Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
}