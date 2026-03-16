import { collection, query, where, getCountFromServer, getAggregateFromServer, sum } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchDashboardMetrics = async () => {
  try {
    const docsRef = collection(db, 'documents');
    const usersRef = collection(db, 'users');

    // 1. Total Documents
    // Efficiently counts the number of documents in the collection
    const docsSnapshot = await getCountFromServer(docsRef);
    const totalDocuments = docsSnapshot.data().count;

    // 2. Total Downloads
    // Automatically adds up the 'downloadCount' field across all documents
    const downloadsSnapshot = await getAggregateFromServer(docsRef, {
      totalDownloads: sum('downloadCount')
    });
    // Fallback to 0 if the sum is null/undefined
    const totalDownloads = downloadsSnapshot.data().totalDownloads || 0; 

    // 3. Active Students (Logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeStudentsQuery = query(
      usersRef, 
      where('lastLogin', '>=', thirtyDaysAgo)
    );
    const activeSnapshot = await getCountFromServer(activeStudentsQuery);
    const activeStudents = activeSnapshot.data().count;

    return { 
      totalDocuments, 
      totalDownloads, 
      activeStudents 
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    // Return safe fallback numbers so the dashboard doesn't crash if an error occurs
    return { totalDocuments: 0, totalDownloads: 0, activeStudents: 0 };
  }
};