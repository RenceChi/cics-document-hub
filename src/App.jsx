import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore"; // Changed getDoc to onSnapshot
import { db } from "./firebase"; 

import Login from "./pages/Login"; 
import StudentHub from "./components/StudentHub";
import AdminDashboard from './pages/admin_pages/AdminDashboard';
import AdminLayout from './pages/admin_pages/AdminLayout'; 
import ManageDocuments from './pages/admin_pages/ManageDocuments'; 
import ManageStudents from './pages/admin_pages/ManageStudents'; 
import Onboarding from "./pages/Onboarding"; 

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeSnapshot = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Use onSnapshot instead of getDoc to listen to live Firestore changes
        // This fixes the race condition where Auth triggers before Firestore data is fully written
        const userDocRef = doc(db, "users", user.uid);
        
        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const safeRole = data.role ? String(data.role).trim().toLowerCase() : "student";
            
            setCurrentUser({ 
              uid: user.uid, 
              role: safeRole, 
              programId: data.programId || "UNKNOWN", 
              ...data 
            });
            setLoading(false);
          } else {
            // User exists in Auth but Firestore doc isn't written yet.
            // We do nothing and wait. The snapshot will fire again instantly once setDoc finishes in Login.jsx
          }
        }, (error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });

      } else {
        setCurrentUser(null);
        setLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f7f8]">
        <div className="text-[#003366] font-bold text-xl">Loading CICS Hub...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        
        {/* LOGIN ROUTE */}
        <Route 
          path="/login" 
          element={
            !currentUser ? (
              <Login />
            ) : currentUser.role === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : currentUser.programId === "UNKNOWN" ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/hub" replace />
            )
          } 
        />

        {/* ONBOARDING */}
        <Route 
          path="/onboarding" 
          element={
            !currentUser ? (
               <Navigate to="/login" replace />
            ) : currentUser.role === "admin" ? (
               <Navigate to="/admin/dashboard" replace />
            ) : currentUser.programId !== "UNKNOWN" ? (
               <Navigate to="/hub" replace /> 
            ) : (
               <Onboarding />
            )
          } 
        />
        
        {/* HUB */}
        <Route 
          path="/hub" 
          element={
            !currentUser ? (
              <Navigate to="/login" replace />
            ) : currentUser.role === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : currentUser.programId === "UNKNOWN" ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <StudentHub currentUser={currentUser} />
            )
          } 
        />
        
        {/* ADMIN ROUTES */}
        <Route 
          path="/admin" 
          element={
            currentUser && currentUser.role === "admin" ? (
              <AdminLayout adminUser={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageStudents />} />
          <Route path="documents" element={<ManageDocuments />} />
        </Route>

        {/* CATCH-ALL */}
        <Route 
          path="*" 
          element={
            <Navigate to={
              !currentUser 
                ? "/login" 
                : currentUser.role === "admin" 
                  ? "/admin/dashboard" 
                  : (currentUser.programId === "UNKNOWN" ? "/onboarding" : "/hub")
            } replace />
          } 
        />
        
      </Routes>
    </Router>
  );
}