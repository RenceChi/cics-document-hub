import React from 'react';

export default function TopStudentsTable({ students }) {
  // Show a fallback message if the data hasn't loaded yet
  if (!students || students.length === 0) {
    return <p className="text-sm text-gray-500">No active students found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-900">Student Name</th>
            <th className="px-4 py-3 font-medium text-gray-900">Email</th>
            <th className="px-4 py-3 font-medium text-gray-900">Total Downloads</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{student.name}</td>
              <td className="px-4 py-3 text-gray-600">{student.email}</td>
              <td className="px-4 py-3 font-semibold text-blue-600">{student.downloads}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}