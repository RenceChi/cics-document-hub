import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import StudentHub from '../components/StudentHub';

export default function StudentDashboard({ currentUser }) {
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth);
    // App.jsx should automatically redirect to login
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* THE HEADER / FRAME */}
      <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm border-b">
        <h1 className="text-xl font-bold text-blue-900">CICS Document Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Hello, Student</span>
          <button 
            onClick={handleLogout}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* THE CONTENT / PICTURE */}
      <main>
        <StudentHub currentUser={currentUser} />
      </main>
    </div>
  );
}