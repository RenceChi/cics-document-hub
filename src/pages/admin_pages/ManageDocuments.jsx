import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase'; 
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
    // Sort by newest first (assuming createdAt exists, fallback to standard array push)
    docsArray.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    setDocuments(docsArray);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Calculate dynamic stats
  // 1. Storage Used
  const totalStorageMB = documents.reduce((acc, doc) => {
    const sizeStr = doc.size || "0 MB";
    const num = parseFloat(sizeStr.replace(' MB', ''));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);
  const storageDisplay = totalStorageMB > 1024 ? `${(totalStorageMB / 1024).toFixed(2)} GB` : `${totalStorageMB.toFixed(1)} MB`;

  // 2. Uploaded Last 30 Days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentUploadsCount = documents.filter(doc => {
    if (!doc.createdAt) return false;
    // Convert Firestore timestamp to JavaScript Date
    return doc.createdAt.toDate() >= thirtyDaysAgo;
  }).length;

  // 3. Total Downloads (Replacing "Pending Review")
  const totalDownloads = documents.reduce((acc, doc) => acc + (doc.downloadCount || 0), 0);

  // Helper to format Firestore timestamps
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

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
    const newTitle = window.prompt("Enter new document title:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    await updateDoc(doc(db, 'documents', id), { title: newTitle });
    fetchDocuments();
  };

  const handleDelete = async (id, storageRefPath) => {
    if (!window.confirm("Are you sure you want to permanently delete this document?")) return;

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
    <div className="min-h-full bg-[#f8fafc] p-8 pb-16">
      
      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#003366] tracking-tight uppercase">Manage Documents</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Centralized repository for institutional records, curriculum guides, and student submissions for the College of Information and Computing Sciences.
          </p>
        </div>
        <label className={`px-5 py-3 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-sm ${isUploading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-[#003366] text-white hover:bg-[#002244]'}`}>
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          {isUploading ? `UPLOADING ${Math.round(uploadProgress)}%` : 'UPLOAD NEW PDF'}
          <input type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
        </label>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-[#003366]">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Repository</h3>
          <span className="text-3xl font-extrabold text-slate-900">{documents.length.toLocaleString()}</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-[#003366]">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">PDFs Uploaded (30D)</h3>
          {/* Now uses real 30-day math! */}
          <span className="text-3xl font-extrabold text-slate-900">{recentUploadsCount}</span> 
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Downloads</h3>
          {/* Changed from Pending Review to Downloads! */}
          <span className="text-3xl font-extrabold text-emerald-600">{totalDownloads.toLocaleString()}</span> 
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-[#003366]">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Storage Used</h3>
          <span className="text-3xl font-extrabold text-slate-900">{storageDisplay}</span>
        </div>
      </div>

      {/* MAIN TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-extrabold text-[#003366] tracking-wider uppercase">Document Archive</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-md text-xs font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
               <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
            </button>
            <button className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-md text-xs font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
               <span className="material-symbols-outlined text-[16px]">download</span> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-[10px] text-slate-400 uppercase tracking-widest font-extrabold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Uploader</th>
                <th className="px-6 py-4">Date Uploaded</th>
                <th className="px-6 py-4">Program Tag</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No documents in repository.</td></tr>
              ) : documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                  
                  {/* Name & Icon */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-red-500 text-3xl opacity-90">picture_as_pdf</span>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1 max-w-md">{doc.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.size || 'Unknown Size'} • PDF Document</p>
                      </div>
                    </div>
                  </td>

                  {/* Uploader Mock */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">SA</div>
                       <span className="text-sm font-medium text-slate-700">System Admin</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-slate-500 font-medium text-sm">
                    {formatDate(doc.createdAt)}
                  </td>

                  {/* Program Tag */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-[#003366] rounded text-[10px] font-extrabold uppercase tracking-wider">
                      {doc.programId === "Computer Science" ? "CS" : 
                       doc.programId === "Information Systems" ? "IS" : 
                       doc.programId === "Cybersecurity" ? "CYB" : 
                       doc.programId === "Information Technology" ? "IT" : 
                       doc.programId === "Data Science" ? "DS" : doc.programId}
                    </span>
                  </td>

                  {/* Action Icons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(doc.id, doc.title)} className="p-1.5 text-slate-400 hover:text-[#003366] rounded hover:bg-slate-100 transition-colors" title="Edit Title">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <a href={doc.downloadUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-[#003366] rounded hover:bg-slate-100 transition-colors" title="Download">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </a>
                      <button onClick={() => handleDelete(doc.id, doc.storageRefPath)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center text-xs text-slate-500">
          <span>Showing 1 to {documents.length} of {documents.length} results</span>
        </div>
      </div>

      {/* UPLOAD DETAILS MODAL (Hidden by default) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Document Details</h2>
            <form onSubmit={handleConfirmUpload} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Document Title</label>
                <input type="text" value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#003366]" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Program</label>
                <select value={programId} onChange={(e) => setProgramId(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#003366]">
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#003366]">
                  <option value="Lecture Notes">Lecture Notes</option>
                  <option value="Past Exams">Past Exams</option>
                  <option value="Lab Manuals">Lab Manuals</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#003366] text-white rounded-lg font-bold hover:bg-[#002244] transition-colors text-sm shadow-sm">Confirm Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDocuments;