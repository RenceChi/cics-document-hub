import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { logUserAction } from "../services/trackingService";

export default function Onboarding() {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const programs = [
    "Computer Science",
    "Information Systems",
    "Cybersecurity",
    "Data Science",
    "Information Technology"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    if (!selectedProgram || !auth.currentUser) return;

    setIsSubmitting(true);
    
    try {
      const userId = auth.currentUser.uid;
      
      // Save their chosen program to Firestore
      await setDoc(doc(db, "users", userId), {
        programId: selectedProgram,
        role: "student"
      }, { merge: true });

      // Log the login action
      await logUserAction(userId, selectedProgram, "LOGIN");
      
      // Force a hard reload so App.jsx pulls the new programId from the database
      window.location.href = "/hub";
    } catch (err) {
      console.error("Error saving program:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#64748b] p-4">
      {/* Top Banner (Optional, to match design) */}
      <div className="absolute top-0 w-full bg-white p-4 shadow-sm flex items-center gap-3 font-bold text-[#003366]">
        <span className="material-symbols-outlined">folder_managed</span>
        CICS Document Hub
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden mt-12">
        <div className="h-32 relative" style={{ backgroundImage: "linear-gradient(135deg, #003366 0%, #004d99 100%)" }}>
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#003366] text-3xl">waving_hand</span>
            </div>
          </div>
        </div>
        
        <div className="pt-14 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome, Eagle!</h2>
          <p className="text-slate-600 mb-8">Let's get your account set up. Please select your undergraduate program to continue to the document hub.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Select your Undergraduate Program
              </label>
              <div className="relative">
                <select 
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 px-4 pr-10 text-slate-900 focus:border-[#003366] focus:ring-[#003366] outline-none"
                  required
                >
                  <option disabled value="">Choose a program...</option>
                  {programs.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <button 
                type="submit" 
                disabled={!selectedProgram || isSubmitting}
                className="flex-1 py-3 px-4 bg-[#003366] text-white font-bold rounded-lg hover:bg-[#002244] transition-all shadow-lg shadow-[#003366]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
          <p className="text-xs text-slate-500 text-center">
            Need help? Contact the CICS Registrar Office.
          </p>
        </div>
      </div>
    </div>
  );
}