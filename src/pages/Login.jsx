import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; 
import { logUserAction } from "../services/trackingService";

export default function Login() {
  const [isSignUpMode, setIsSignUpMode] = useState(false); // Toggles between Login and Sign Up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const auth = getAuth();

    try {
      if (isSignUpMode) {
        // --- SIGN UP LOGIC ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 1. Define your VIP Admin emails here (all lowercase!)
        const adminEmails = [
          "clark.admin@gmail.com", // Add your own email so you get admin rights!
          "professor.name@neu.edu.ph" // Add your professor's exact email here
        ];

        // 2. Check if the email they typed is on the VIP list
        const isVipAdmin = adminEmails.includes(user.email.toLowerCase());

        // 3. Build their initial Firestore profile based on who they are
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: isVipAdmin ? "admin" : "student", // Automatically assigns the right role!
          programId: isVipAdmin ? "ADMIN" : "UNKNOWN", // Skips onboarding for admins
          isBlocked: false,
          createdAt: serverTimestamp()
        });

      } else {
        // --- LOG IN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Quickly fetch their doc to log the login action if they are already setup
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.programId && data.programId !== "UNKNOWN" && data.role !== "admin") {
            logUserAction(user.uid, data.programId, "LOGIN").catch(console.warn);
          }
        }
      }
      
      // Note: App.jsx handles the redirect automatically when auth state changes!

    } catch (err) {
      console.error(err);
      // Make Firebase errors look a little friendlier to the user
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try signing in instead.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Incorrect email or password.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f8] font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-[#003366]/10 px-8 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="text-[#003366] w-8 h-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-slate-900 text-xl font-bold tracking-tight">CICS Document Hub</h2>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#003366]/20 blur-3xl"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#003366]/10 blur-3xl"></div>
        </div>

        {/* Main Auth Card */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#003366]/5 p-8 z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-[#003366]/5 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#003366] text-4xl">
                {isSignUpMode ? 'person_add' : 'school'}
              </span>
            </div>
            <h1 className="text-slate-900 text-2xl font-bold mb-2">
              {isSignUpMode ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500">
              {isSignUpMode ? 'Join the CICS Document Hub.' : 'Access your academic resources in one place.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
            
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-[#003366]"
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-[#003366]"
              required
            />
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#003366] text-white font-medium rounded-lg hover:bg-[#002244] transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? "Processing..." : (isSignUpMode ? "Sign Up" : "Sign In")}
            </button>
          </form>

          {/* TOGGLE BUTTON */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {isSignUpMode ? "Already have an account? " : "Don't have an account? "}
              <button 
                onClick={() => {
                  setIsSignUpMode(!isSignUpMode);
                  setError(""); // Clear errors when switching modes
                }} 
                className="text-[#003366] font-bold hover:underline"
              >
                {isSignUpMode ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-slate-400 text-sm">
        <p>© 2026 College of Informatics and Computing Sciences. New Era University.</p>
      </footer>
    </div>
  );
}