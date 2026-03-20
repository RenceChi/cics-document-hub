import { useState, useEffect } from 'react';
import StudentLoginsChart from '../../components/StudentLoginsChart';
import { db } from '../../firebase'; 
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'; 

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalDocuments: 0, totalDownloads: 0, activeStudents: 0 });
  const [topDocuments, setTopDocuments] = useState([]); 
  const [topStudents, setTopStudents] = useState([]); // NEW: State for top students
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to calculate "Time Ago"
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Never";
    
    // Fallback if it's a server timestamp that hasn't fully resolved yet
    const date = timestamp.toDate ? timestamp.toDate() : new Date(); 
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  // Helper function to determine Online/Away/Offline status
  const getStatus = (timestamp) => {
    if (!timestamp) return { text: "OFFLINE", color: "bg-gray-100 text-gray-500" };
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    const minutesAgo = (new Date() - date) / 60000;

    if (minutesAgo < 15) return { text: "ONLINE", color: "bg-emerald-100 text-emerald-700" };
    if (minutesAgo < 60) return { text: "AWAY", color: "bg-amber-100 text-amber-700" };
    return { text: "OFFLINE", color: "bg-gray-100 text-gray-500" };
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch all documents
        const docsSnapshot = await getDocs(collection(db, 'documents'));
        const docsCount = docsSnapshot.size;
        
        let downloadsCount = 0;
        docsSnapshot.forEach(doc => {
          downloadsCount += (doc.data().downloadCount || 0);
        });

        // 2. Fetch Top 5 Most Downloaded Documents
        const topDocsQuery = query(collection(db, 'documents'), orderBy('downloadCount', 'desc'), limit(5));
        const topDocsSnapshot = await getDocs(topDocsQuery);
        const topDocsArray = topDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 3. Fetch Active Students & Top Students
        const studentsQuery = query(collection(db, 'users'), where("role", "==", "student"));
        const studentsSnapshot = await getDocs(studentsQuery);
        
        let activeStudentsCount = 0;
        const allStudents = [];
        
        studentsSnapshot.forEach(doc => {
          const data = doc.data();
          if (!data.isBlocked) activeStudentsCount++;
          allStudents.push({ id: doc.id, ...data });
        });

        // Sort students in JavaScript by activityScore to avoid needing complex Firebase Indexes
        const sortedTopStudents = allStudents
          .sort((a, b) => (b.activityScore || 0) - (a.activityScore || 0))
          .slice(0, 5); // Take top 5

        // 4. Update all states
        setTopDocuments(topDocsArray);
        setTopStudents(sortedTopStudents);
        setMetrics({ 
          totalDocuments: docsCount.toLocaleString(), 
          totalDownloads: downloadsCount.toLocaleString(), 
          activeStudents: activeStudentsCount.toLocaleString() 
        });

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#003366]">
          <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
          <p className="font-bold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] p-8 pb-16">
      
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
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Documents</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900">{metrics.totalDocuments}</p>
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 bg-blue-50 text-[#003366] rounded-lg flex items-center justify-center">
             <span className="material-symbols-outlined">description</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Students</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900">{metrics.activeStudents}</p>
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 bg-blue-50 text-[#003366] rounded-lg flex items-center justify-center">
             <span className="material-symbols-outlined">person</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Downloads</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900">{metrics.totalDownloads}</p>
          </div>
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
          </div>
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
           </div>
           
           <div className="flex flex-col gap-4 mt-6">
              {topDocuments.length === 0 ? (
                 <p className="text-sm text-gray-500 italic">No downloads recorded yet.</p>
              ) : topDocuments.map((doc) => (
                 <div key={doc.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                       <span className="text-sm font-semibold text-gray-700 truncate max-w-[200px]" title={doc.title}>{doc.title}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{doc.downloadCount || 0} DLs</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* TOP STUDENTS TABLE */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
           <h3 className="text-base font-bold text-gray-900">Top Active Students</h3>
           <button className="text-sm font-bold text-[#003366] hover:underline">View All Students</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Documents Accessed</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">
                    No active students to display.
                  </td>
                </tr>
              ) : topStudents.map((student) => {
                const status = getStatus(student.lastActive || student.lastLogin);
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#003366] flex items-center justify-center font-bold text-xs shrink-0">
                        {student.name ? student.name.charAt(0).toUpperCase() : student.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900">{student.name || "Student User"}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{student.activityScore || 0}</td>
                    <td className="px-6 py-4 text-gray-500">{getTimeAgo(student.lastActive || student.lastLogin)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}