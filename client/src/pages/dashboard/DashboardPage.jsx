import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardSummary, getMyStats, getActivityFeed } from '../../api/dashboard.api';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ label, value, badge }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-10 min-h-[180px] shadow-sm hover:shadow-md transition-all duration-200">
    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
      {badge}
    </p>

    <div className="mt-5">
      <p className="text-5xl font-black text-black">
        {value ?? "0"}
      </p>

      <p className="text-sm text-gray-500 mt-2">
        {label}
      </p>
    </div>
  </div>
);

const MetricCard = ({ label, value }) => (
<div className="bg-gray-50 border border-gray-100 rounded-xl p-8 min-h-[150px] flex flex-col justify-between hover:bg-gray-100 transition-all duration-200">
    <p className="text-3xl font-black text-black">
      {value ?? "0"}
    </p>

    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
      {label}
    </p>
  </div>
);
const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [myStats, setMyStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, ms, feed] = await Promise.all([
          getDashboardSummary(),
          getMyStats(),
          getActivityFeed({ limit: 5 }),
        ]);
        setSummary(s.data.data);
        setMyStats(ms.data.data);
        setActivity(feed.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-64 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  );


  return (
  <div className="max-w-[1400px] mx-auto px-8 py-6 space-y-8">

    {/* Header */}
    <div className=''>
      <h1 className="text-4xl font-black text-black tracking-tight">
        Good evening, {user?.name?.split(' ')[0]} 
      </h1>
      <p className="text-base text-gray-500 mt-2">
        Here's your overview for today.
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <StatCard
        label="Total Projects"
        value={summary?.totalProjects}
        badge="All Time"
      />
      <StatCard
        label="Active Projects"
        value={summary?.activeProjects}
        badge="Live Now"
      />
      <StatCard
        label="Total Tasks"
        value={summary?.totalTasks}
        badge="Assigned"
      />
      <StatCard
        label="Overdue Tasks"
        value={summary?.overdueCount}
        badge="Needs Attention"
      />
    </div>

    {/* Main Content */}
   <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-x-10 py-8 ">

      {/* Left Section */}
      <div className="space-y-12">

        {/* Metrics */}
        <div className="bg-white border border-gray-200 rounded-2xl mt-8 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
            My Metrics
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard label="Assigned" value={myStats?.assigned} />
            <MetricCard label="Done Today" value={myStats?.completedToday} />
            <MetricCard label="Overdue" value={myStats?.overdue} />
            <MetricCard label="My Projects" value={myStats?.projects} />
          </div>
        </div>

      </div>

      {/* Activity Feed */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col min-h-[500px]">

        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
          Recent Activity
        </p>

        <div className="flex-1 space-y-6 relative before:absolute before:left-[8px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200">

          {activity.length > 0 ? (
            activity.map((a) => (
              <div key={a._id} className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-[3px] border-black" />

                <p className="text-sm text-gray-700 leading-relaxed">
                  {a.message}
                </p>

                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-2">
                  {formatDistanceToNow(
                    new Date(a.createdAt),
                    { addSuffix: true }
                  )}
                </p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center flex-1">
              <p className="text-gray-400 text-sm">
                No activity yet.
              </p>
            </div>
          )}

        </div>

        <button className="mt-8 w-full py-3 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all duration-200">
          View all activity →
        </button>
      </div>

    </div>
  </div>
);
};

export default DashboardPage;