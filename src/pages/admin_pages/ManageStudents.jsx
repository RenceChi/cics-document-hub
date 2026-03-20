import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', studentId: '', programId: 'Computer Science' });

  const availablePrograms = ["Computer Science", "Information System", "Cybersecurity", "Data Science", "Information Technology"];

  // 1. READ: Fetch Students
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'users'), where("role", "==", "student"));
      const querySnapshot = await getDocs(q);
      const studentsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setStudents(studentsArray);
      setFilteredStudents(studentsArray);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. FILTER: Search Logic
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = students.filter(s => 
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.programId && s.programId.toLowerCase().includes(term)) ||
      (s.studentId && s.studentId.toLowerCase().includes(term))
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // 3. UPDATE: Block/Unblock Toggle
  const toggleBlockStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Optimistic UI update
    setStudents(students.map(s => s.id === id ? { ...s, isBlocked: newStatus } : s));

    try {
      await updateDoc(doc(db, 'users', id), { isBlocked: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert if failed
      setStudents(students.map(s => s.id === id ? { ...s, isBlocked: currentStatus } : s));
    }
  };

  // 4. CREATE: Add New Student (Pre-registration)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      // Add to Firestore so it's ready when they sign up
      const docRef = await addDoc(collection(db, 'users'), {
        name: newStudent.name,
        email: newStudent.email.toLowerCase(),
        studentId: newStudent.studentId,
        programId: newStudent.programId,
        role: "student",
        isBlocked: false,
        createdAt: serverTimestamp()
      });

      // Update local state instantly
      const addedStudent = { id: docRef.id, ...newStudent, isBlocked: false };
      setStudents([addedStudent, ...students]);
      
      // Close modal & reset
      setIsAddModalOpen(false);
      setNewStudent({ name: '', email: '', studentId: '', programId: 'Computer Science' });
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student.");
    }
  };

  // 5. DELETE: Remove Student
  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student's record?")) {
      try {
        await deleteDoc(doc(db, 'users', id));
        setStudents(students.filter(s => s.id !== id));
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student.");
      }
    }
  };

  return (
    <div className="min-h-full bg-[#f8fafc] p-8">
      
      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Students</h1>
          <p className="text-slate-500 text-sm mt-1">CICS Institutional Student Records & Directory</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
             <span className="material-symbols-outlined text-[18px]">download</span> Export List
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#003366] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#002244] flex items-center gap-2 transition-colors"
          >
             <span className="material-symbols-outlined text-[18px]">person_add</span> Add New Student
          </button>
        </div>
      </div>

      {/* SEARCH AND STATS ROW */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Search Box */}
        <div className="flex-1 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="flex-1 flex items-center pl-3">
             <span className="material-symbols-outlined text-slate-400">search</span>
             <input 
               type="text" 
               placeholder="Filter by Name, ID, or Program..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full border-none focus:ring-0 text-sm px-3 py-2 text-slate-700 outline-none"
             />
          </div>
          <button className="bg-slate-50 border border-slate-200 text-slate-700 px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
            Apply Filters
          </button>
        </div>

        {/* Stats Card (Matching Wireframe) */}
        <div className="bg-[#003366] rounded-xl p-5 text-white shadow-md flex flex-col justify-center min-w-[250px]">
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Enrolled Total</h3>
           <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">{students.length}</span>
              <span className="text-xs text-blue-200 font-medium">+12% from last term</span>
           </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 font-bold">Loading directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">@neu.edu.ph Email</th>
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-500">No students found.</td></tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#003366] flex items-center justify-center font-bold text-sm shrink-0">
                            {(student.name?.charAt(0) || student.email?.charAt(0) || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{student.name || "Pending Setup"}</p>
                            <p className="text-xs text-slate-400 font-mono">ID: {student.studentId || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{student.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {student.programId === "UNKNOWN" ? "PENDING" : student.programId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${student.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                          <span className={`text-xs font-bold ${student.isBlocked ? 'text-red-600' : 'text-emerald-600'}`}>
                            {student.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4">
                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Block Access</span>
                            <button 
                              onClick={() => toggleBlockStatus(student.id, student.isBlocked)}
                              className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${student.isBlocked ? 'bg-red-500' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm ${student.isBlocked ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                          </div>
                          {/* Delete Button */}
                          <button onClick={() => handleDeleteStudent(student.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Delete Student">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Add New Student</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" required
                  value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#003366]"
                  placeholder="e.g. Julian Dela Cruz"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NEU Email</label>
                <input 
                  type="email" required
                  value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#003366]"
                  placeholder="student@neu.edu.ph"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student ID</label>
                  <input 
                    type="text"
                    value={newStudent.studentId} onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#003366]"
                    placeholder="2021-10042"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Program</label>
                  <select 
                    value={newStudent.programId} onChange={(e) => setNewStudent({...newStudent, programId: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#003366]"
                  >
                    {availablePrograms.map(prog => (
                      <option key={prog} value={prog}>{prog}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-lg transition-colors">
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageStudents;