import React from 'react';

export default function DocumentCard({ doc, onDownload }) {
  // Helper to format the Firebase timestamp into "Oct 12, 2023"
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recent';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    // Changed to a taller, vertical layout with standard width to fit perfectly in a grid
    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-[320px] w-full">
      
      {/* Top Row: Icon & Category Tag */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
        </div>
        <span className="bg-blue-50 text-[#003366] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
          {doc.category || 'DOCUMENT'}
        </span>
      </div>

      {/* Title & Description */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 text-lg line-clamp-2 leading-snug mb-2" title={doc.title}>
          {doc.title}
        </h3>
        {/* Fallback description in case the document doesn't have one in the database */}
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {doc.description || `Comprehensive academic resource verified for the ${doc.programId || 'CICS'} program.`}
        </p>
      </div>

      {/* Meta Info (Date & Size) */}
      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mt-4 mb-5">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          {formatDate(doc.createdAt)}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">insert_drive_file</span>
          {doc.size || 'PDF'}
        </div>
      </div>

      {/* Footer: Program Tag & Download Button */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase px-3 py-1.5 rounded-md tracking-wider max-w-[130px] truncate" title={doc.programId}>
          {doc.programId || 'UNKNOWN'}
        </span>
        <button 
          onClick={() => onDownload(doc)}
          className="bg-[#003366] hover:bg-[#002244] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Download
        </button>
      </div>
      
    </div>
  );
}