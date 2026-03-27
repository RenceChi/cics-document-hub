import React, { useState } from "react";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; 
import { logUserAction } from "../services/trackingService";

export default function Login() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");             
  const [studentId, setStudentId] = useState("");   
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Define VIP Admin emails here
  const adminEmails = ["jcesperanza@neu.edu.ph"];

  // --- STANDARD EMAIL AUTH ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const auth = getAuth();

    try {
      if (isSignUpMode) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const isVipAdmin = adminEmails.includes(user.email.toLowerCase());

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: name,               
          studentId: studentId,     
          role: isVipAdmin ? "admin" : "student", 
          programId: isVipAdmin ? "ADMIN" : "UNKNOWN", 
          isBlocked: false,
          createdAt: serverTimestamp()
        });

      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.programId && data.programId !== "UNKNOWN" && data.role !== "admin") {
            logUserAction(user.uid, data.programId, "LOGIN").catch(console.warn);
          }
        }
      }
    } catch (err) {
      console.error(err);
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

  // --- GOOGLE AUTH LOGIC ---
  const handleGoogleAuth = async () => {
    setError("");
    setIsLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      // If they are logging in with Google for the FIRST time, provision their Firestore document
      if (!userDoc.exists()) {
        const isVipAdmin = adminEmails.includes(user.email.toLowerCase());

        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || "Google User",
          studentId: "", // They can update this later in profile or onboarding
          role: isVipAdmin ? "admin" : "student",
          programId: isVipAdmin ? "ADMIN" : "UNKNOWN",
          isBlocked: false,
          createdAt: serverTimestamp()
        });
      } else {
        // Existing user logging in
        const data = userDoc.data();
        if (data.programId && data.programId !== "UNKNOWN" && data.role !== "admin") {
          logUserAction(user.uid, data.programId, "LOGIN").catch(console.warn);
        }
      }
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Google Sign-In failed. Please try again.");
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
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#003366]/5 p-8 z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-[#003366]/5 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#003366] text-3xl">
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

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUpMode && (
              <>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-[#003366]"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Student ID (e.g., 2021-10042)" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-[#003366]"
                  required
                />
              </>
            )}

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

          {/* GOOGLE DIVIDER */}
          <div className="mt-6 flex items-center justify-between">
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
            <span className="text-xs text-center text-slate-500 uppercase">or continue with</span>
            <span className="w-1/5 border-b border-slate-200 lg:w-1/4"></span>
          </div>

          {/* GOOGLE BUTTON */}
          <button 
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="w-5 h-5" />
            Google
          </button>

          {/* TOGGLE MODE */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {isSignUpMode ? "Already have an account? " : "Don't have an account? "}
              <button 
                onClick={() => {
                  setIsSignUpMode(!isSignUpMode);
                  setError(""); 
                }} 
                className="text-[#003366] font-bold hover:underline"
              >
                {isSignUpMode ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}