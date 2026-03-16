import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase'; // Make sure this path is correct!
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const ManageDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [programId, setProgramId] = useState('Computer Science');
  const [category, setCategory] = useState('Lecture Notes');

  const fetchDocuments = async () => {
    const querySnapshot = await getDocs(collection(db, 'documents'));
    const docsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDocuments(docsArray);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 1. Triggers when Admin selects a file from their computer
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return alert('Please select a PDF file.');
    
    setSelectedFile(file);
    setFileTitle(file.name.replace('.pdf', '')); // Default title is the file name
    setShowModal(true); // Open the details modal
  };

  // 2. Triggers when Admin clicks "Confirm & Upload" in the modal
  const handleConfirmUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setShowModal(false);
    setIsUploading(true);
    
    const storageRefPath = `documents/${Date.now()}_${selectedFile.name}`;
    const fileRef = ref(storage, storageRefPath);
    const uploadTask = uploadBytesResumable(fileRef, selectedFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
        alert("Upload failed. Check console.");
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        
        await addDoc(collection(db, 'documents'), {
          title: fileTitle,               
          programId: programId,           
          category: category,             
          downloadUrl: downloadUrl,       
          storageRefPath: storageRefPath,
          size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
          downloadCount: 0,              
          createdAt: serverTimestamp()
        });
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        fetchDocuments(); // Refresh table
      }
    );
  };

  const handleEdit = async (id, currentTitle) => {
    const newTitle = window.prompt("Enter new title:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    await updateDoc(doc(db, 'documents', id), { title: newTitle });
    fetchDocuments();
  };

  const handleDelete = async (id, storageRefPath) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      if (storageRefPath) {
        const fileRef = ref(storage, storageRefPath);
        await deleteObject(fileRef);
      }
      await deleteDoc(doc(db, 'documents', id));
      fetchDocuments(); 
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Documents</h1>
        <div>
          <label className={`px-4 py-2 rounded font-bold cursor-pointer transition-colors ${isUploading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#003366] text-white hover:bg-[#002244]'}`}>
            {isUploading ? `Uploading ${Math.round(uploadProgress)}%` : '+ Upload PDF'}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
          </label>
        </div>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50 text-left text-sm font-semibold text-gray-600">
          <tr>
            <th className="px-6 py-3 border-b">Title</th>
            <th className="px-6 py-3 border-b">Program</th>
            <th className="px-6 py-3 border-b">Category</th>
            <th className="px-6 py-3 border-b">Size</th>
            <th className="px-6 py-3 border-b">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {documents.length === 0 ? (
             <tr><td colSpan="5" className="text-center py-8 text-gray-500">No documents found.</td></tr>
          ) : documents.map((doc) => (
            <tr key={doc.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{doc.title}</td>
              <td className="px-6 py-4 text-gray-600">{doc.programId}</td>
              <td className="px-6 py-4 text-gray-600"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{doc.category}</span></td>
              <td className="px-6 py-4 text-gray-600">{doc.size}</td>
              <td className="px-6 py-4 space-x-4">
                <button onClick={() => handleEdit(doc.id, doc.title)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                <button onClick={() => handleDelete(doc.id, doc.storageRefPath)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* UPLOAD DETAILS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Document Details</h2>
            <form onSubmit={handleConfirmUpload} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Document Title</label>
                <input type="text" value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:border-[#003366] outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Program</label>
                <select value={programId} onChange={(e) => setProgramId(e.target.value)} className="w-full border border-gray-300 rounded p-2 outline-none">
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded p-2 outline-none">
                  <option value="Lecture Notes">Lecture Notes</option>
                  <option value="Past Exams">Past Exams</option>
                  <option value="Lab Manuals">Lab Manuals</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-[#003366] text-white rounded font-bold hover:bg-[#002244] transition-colors">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDocuments;