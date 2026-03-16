import React from 'react';

export default function DocumentCard({ doc, onDownload }) {
  return (
    
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full min-h-[192px] w-full max-w-[380px]">
      
      {/* Top Section: Icon and Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
        </div>
        {/* Added min-w-0 to ensure flex child doesn't overflow its container */}
        <div className="flex-1 min-w-0">
          {/* 2. Changed line-clamp to 3, and added 'break-words' so long filenames with underscores wrap nicely */}
          <h3 className="font-bold text-slate-900 line-clamp-3 text-sm break-words leading-snug" title={doc.title}>
            {doc.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {doc.category || 'General Document'}
          </p>
        </div>
      </div>

      {/* Bottom Section: Program Tag & Button */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
        {/* 3. Removed max-w-[120px] and truncate so 'Information Technology' fits entirely */}
        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-3 py-1.5 rounded-md tracking-wider text-center leading-tight">
          {doc.programId || 'UNKNOWN'}
        </span>
        
        {/* Added shrink-0 so the download button never gets squished by a long program name */}
        <button 
          onClick={() => onDownload(doc)}
          className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Download
        </button>
      </div>
      
    </div>
  );
}