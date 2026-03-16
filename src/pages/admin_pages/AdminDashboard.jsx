import { useState, useEffect } from 'react';
import StudentLoginsChart from '../../components/StudentLoginsChart';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalDocuments: 0, totalDownloads: 0, activeStudents: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Placeholder data to match your wireframe
        setMetrics({ totalDocuments: '1,284', totalDownloads: '8,920', activeStudents: '452' });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="min-h-full bg-[#f8fafc] p-8">
      
      {/* Top Header Area */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search data..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#003366] w-64 shadow-sm"
            />
          </div>
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#003366] shadow-sm relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* System Overview Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003366]">bar_chart</span>
          <h2 className="text-sm font-bold text-gray-700">System Overview</h2>
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm text-xs font-semibold">
          <button className="px-4 py-1.5 text-gray-500 hover:text-gray-900 rounded-md">Daily</button>
          <button className="px-4 py-1.5 bg-gray-100 text-[#003366] rounded-md shadow-sm">Weekly</button>
          <button className="px-4 py-1.5 text-gray-500 hover:text-gray-900 rounded-md">Monthly</button>
        </div>
      </div>

      {/* SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        
        {/* Card 1 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Documents</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900">{metrics.totalDocuments}</p>
            <span className="text-xs font-bold text-emerald-500 flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span>+12%</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 italic">vs last week</p>
          <div className="absolute top-4 right-4 w-10 h-10 bg-blue-50 text-[#003366] rounded-lg flex items-center justify-center">
             <span className="material-symbols-outlined">description</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Students</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900">{metrics.activeStudents}</p>
            <span className="text-xs font-bold text-emerald-500 flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span>+5%</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 italic">vs last week</p>
          <div className="absolute top-4 right-4 w-10 h-10 bg-blue-50 text-[#003366] rounded-lg flex items-center justify-center">
             <span className="material-symbols-outlined">person</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Downloads</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900">{metrics.totalDownloads}</p>
            <span className="text-xs font-bold text-emerald-500 flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span>+18%</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 italic">vs last week</p>
          <div className="absolute top-4 right-4 w-10 h-10 bg-blue-50 text-[#003366] rounded-lg flex items-center justify-center">
             <span className="material-symbols-outlined">download</span>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[300px]">
          <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="text-base font-bold text-gray-900">Student Logins Over Time</h3>
                <p className="text-xs text-gray-500">Engagement activity for the current week</p>
             </div>
             <div className="text-right">
                <p className="text-xl font-bold text-gray-900">2,450</p>
                <p className="text-xs font-bold text-emerald-500">+8.2% from Monday</p>
             </div>
          </div>
          {/* Your Chart Component Goes Here */}
          <div className="h-64 w-full mt-4 min-w-0 min-h-0">
             <StudentLoginsChart />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm min-h-[300px]">
           <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="text-base font-bold text-gray-900">Most Downloaded Documents</h3>
                <p className="text-xs text-gray-500">Top 5 resources by volume</p>
             </div>
             <button className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">more_vert</span></button>
           </div>
           
           {/* Mockup list of top documents to match wireframe empty state area */}
           <div className="flex flex-col gap-4 mt-6">
              {['CS5001_Syllabus.pdf', 'Thesis_Guide_2024.pdf', 'Math_Lec_04.pdf'].map((doc, i) => (
                 <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                       <span className="text-sm font-semibold text-gray-700">{doc}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{300 - (i*45)} DLs</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* TOP STUDENTS TABLE (Matching the wireframe table style) */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
           <h3 className="text-base font-bold text-gray-900">Top Active Students</h3>
           <button className="text-sm font-bold text-[#003366] hover:underline">View All Students</button>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Documents Accessed</th>
              <th className="px-6 py-4">Last Active</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Row 1 */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">JS</div>
                <span className="font-bold text-gray-900">John Smith</span>
              </td>
              <td className="px-6 py-4 text-gray-600">124</td>
              <td className="px-6 py-4 text-gray-500">2 mins ago</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase rounded-full">Online</span>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">AD</div>
                <span className="font-bold text-gray-900">Alice Doe</span>
              </td>
              <td className="px-6 py-4 text-gray-600">98</td>
              <td className="px-6 py-4 text-gray-500">1 hour ago</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase rounded-full">Away</span>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs">MR</div>
                <span className="font-bold text-gray-900">Michael Ross</span>
              </td>
              <td className="px-6 py-4 text-gray-600">76</td>
              <td className="px-6 py-4 text-gray-500">5 hours ago</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-extrabold uppercase rounded-full">Offline</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}