import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; 

// Adjusting paths based on your folder structure
import Login from "./pages/Login"; 
import StudentHub from "./components/StudentHub";
import AdminDashboard from './pages/admin_pages/AdminDashboard';
import AdminLayout from './pages/admin_pages/AdminLayout'; 
import ManageDocuments from './pages/admin_pages/ManageDocuments'; // Add this! (Check your path)
import ManageStudents from './pages/admin_pages/ManageStudents'; // Add this! (Check your path)
import Onboarding from "./pages/Onboarding"; // Your standalone onboarding page

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This "listens" to Firebase for any login/logout changes
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const safeRole = data.role ? String(data.role).trim().toLowerCase() : "student";
            setCurrentUser({ 
              uid: user.uid, 
              role: safeRole, // Explicitly grab the role
              programId: data.programId || "UNKNOWN", 
              ...data 
            });
          } else {
            setCurrentUser({ uid: user.uid, role: "student", programId: "UNKNOWN" });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    console.log("CURRENT USER STATE:", currentUser);
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f7f8]">
        <div className="text-[#003366] font-bold text-xl">Loading CICS Hub...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        
        {/* LOGIN ROUTE: Smart redirect based on role */}
        <Route 
          path="/login" 
          element={
            !currentUser ? (
              <Login />
            ) : currentUser.role === "admin" ? (
              <Navigate to="/admin/dashboard" />
            ) : currentUser.programId === "UNKNOWN" ? (
              <Navigate to="/onboarding" />
            ) : (
              <Navigate to="/hub" />
            )
          } 
        />

        {/* ONBOARDING: Only for students who haven't picked a program */}
        <Route 
          path="/onboarding" 
          element={
            currentUser && currentUser.role !== "admin" ? (
              <Onboarding />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* HUB: Only for students */}
        <Route 
          path="/hub" 
          element={
            currentUser && currentUser.role === "student" ? (
              <StudentHub currentUser={currentUser} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* ADMIN ROUTES: Strictly guarded by role */}
        <Route 
          path="/admin" 
          element={
            currentUser && currentUser.role === "admin" ? (
              <AdminLayout adminUser={currentUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageStudents />} />
          <Route path="documents" element={<ManageDocuments />} />
        </Route>

        {/* CATCH-ALL: Sends users to their respective "Home" if they type a random URL */}
        <Route 
          path="*" 
          element={
            <Navigate to={
              !currentUser 
                ? "/login" 
                : currentUser.role === "admin" 
                  ? "/admin/dashboard" 
                  : (currentUser.programId === "UNKNOWN" ? "/onboarding" : "/hub")
            } />
          } 
        />
        
      </Routes>
    </Router>
  );
}