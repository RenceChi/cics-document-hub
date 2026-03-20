import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

export default function AdminLayout({ adminUser }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Helper to check if a link is active
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-sans">
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      {/* SIDEBAR (Matches Wireframe) */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="flex h-20 items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003366] rounded-md flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">account_balance</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">CICS Hub</h1>
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Admin Panel</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="mt-6 flex flex-col space-y-1 px-4 flex-1">
          <Link to="/admin/dashboard" onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive('dashboard') ? 'bg-[#003366] text-white shadow-md shadow-[#003366]/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Dashboard
          </Link>
          
          <Link to="/admin/documents" onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive('documents') ? 'bg-[#003366] text-white shadow-md shadow-[#003366]/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <span className="material-symbols-outlined text-[20px]">folder</span>
            Manage Documents
          </Link>

          <Link to="/admin/users" onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive('users') ? 'bg-[#003366] text-white shadow-md shadow-[#003366]/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <span className="material-symbols-outlined text-[20px]">group</span>
            Manage Students
          </Link>
        </nav>

        {/* Bottom Profile Area */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 bg-[#003366]/10 text-[#003366] rounded-full flex items-center justify-center font-bold text-xs">
                {adminUser?.email ? adminUser.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">{adminUser?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors" title="Log out">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* We moved the top header inside the Dashboard component to match the wireframe perfectly! */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}