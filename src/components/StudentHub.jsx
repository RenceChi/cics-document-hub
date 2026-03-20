import React, { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth"; 
import { db } from "../firebase";
import { logUserAction } from "../services/trackingService";

// IMPORT YOUR NEW COMPONENT HERE (Adjust path if needed)
import DocumentCard from "../components/DocumentCard"; 

export default function StudentHub({ currentUser }) {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  const [selectedPrograms, setSelectedPrograms] = useState([]); 

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const q = query(collection(db, "documents"));
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(docsData);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.programId && currentUser.programId !== "UNKNOWN") {
      fetchDocuments();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleDownload = async (doc) => {
    logUserAction(currentUser.uid, currentUser.programId, "FILE_DOWNLOAD", {
      documentId: doc.id,
      documentTitle: doc.title
    }).catch(console.warn);
    window.open(doc.downloadUrl, "_blank"); // Changed from doc.fileUrl to doc.downloadUrl based on your upload script!
  };

  const handleProgramToggle = (programName) => {
    setSelectedPrograms(prev => 
      prev.includes(programName) 
        ? prev.filter(p => p !== programName) 
        : [...prev, programName]
    );
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Resources" || doc.category === selectedCategory;
    const matchesProgram = selectedPrograms.length === 0 || selectedPrograms.includes(doc.programId);
    return matchesSearch && matchesCategory && matchesProgram;
  });

  const categories = [
    { name: "All Resources", icon: "folder" },
    { name: "Lecture Notes", icon: "description" },
    { name: "Past Exams", icon: "quiz" },
    { name: "Lab Manuals", icon: "lab_profile" }
  ];

  const availablePrograms = [
    "Computer Science", 
    "Information System", 
    "Cybersecurity", 
    "Data Science",
    "Information Technology"
  ];

  return (
    <div className="bg-[#f5f7f8] font-sans text-slate-900 min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-[#003366]">
            <div className="w-8 h-8 bg-[#003366] rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">folder_managed</span>
            </div>
            <h2 className="hidden md:block text-[#003366] text-lg font-bold leading-tight tracking-tight">CICS Hub</h2>
          </div>
          
          <div className="flex w-64 md:w-96 items-stretch rounded-lg h-10 overflow-hidden border border-slate-200">
            <div className="text-slate-400 flex bg-slate-50 items-center justify-center px-3">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="w-full border-none bg-slate-50 focus:outline-0 focus:ring-0 text-sm placeholder:text-slate-400 px-2" 
              placeholder="Search by course code, title, or professor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:underline">Log Out</button>
          <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center text-[#003366] font-bold">
             {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'S'}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar Filters */}
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-6 hidden lg:flex flex-col gap-8 min-h-[calc(100vh-65px)]">
          <div>
            <h3 className="text-[#003366] text-xs font-bold uppercase tracking-wider mb-4">Categories</h3>
            <nav className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                    selectedCategory === cat.name ? "bg-[#003366]/10 text-[#003366] font-semibold" : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-[#003366] text-xs font-bold uppercase tracking-wider mb-4">Programs</h3>
            <div className="flex flex-col gap-3">
              {availablePrograms.map(prog => (
                <label key={prog} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedPrograms.includes(prog)}
                    onChange={() => handleProgramToggle(prog)}
                    className="rounded border-slate-300 text-[#003366] focus:ring-[#003366] h-4 w-4"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-[#003366]">{prog}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span>Dashboard</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="font-medium text-slate-900">Document Library</span>
              </nav>
              <h1 className="text-3xl font-bold text-slate-900">Document Library</h1>
              <p className="text-slate-500 text-sm mt-1">Browse and download verified academic resources for your courses.</p>
            </div>
            
            {/* Added Filter and Sort buttons to match the wireframe */}
            <div className="flex items-center gap-3">
               <button className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
                 <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
               </button>
               <button className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
                 <span className="material-symbols-outlined text-[18px]">sort</span> Sort
               </button>
            </div>
          </div>

          {/* Document Grid - CHANGED TO CSS GRID FOR PERFECT ALIGNMENT */}
          {isLoading ? (
            <div className="py-10 text-center text-slate-500 font-bold">Loading your resources...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 bg-white border border-slate-200 rounded-xl border-dashed">
               <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">folder_off</span>
               <p>No documents match your selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDocuments.map(doc => (
                 <DocumentCard key={doc.id} doc={doc} onDownload={handleDownload} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}