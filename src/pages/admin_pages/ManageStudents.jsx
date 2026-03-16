import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      // Create a query that specifically asks for students only
      const q = query(collection(db, 'users'), where("role", "==", "student"));
      
      const querySnapshot = await getDocs(q);
      const studentsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setStudents(studentsArray);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };
  useEffect(() => {
    fetchStudents();
  }, []);

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Students</h1>

      <table className="min-w-full bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-6 py-3 border-b">Name / Email</th>
            <th className="px-6 py-3 border-b">Status</th>
            <th className="px-6 py-3 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b">
              <td className="px-6 py-4">{student.email}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-sm ${student.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {student.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </td>
              <td className="px-6 py-4">
                <button 
                  onClick={() => toggleBlockStatus(student.id, student.isBlocked)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                >
                  {student.isBlocked ? 'Unblock Student' : 'Block Student'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageStudents;