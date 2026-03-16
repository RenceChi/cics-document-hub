import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchTopStudents = async () => {
  try {
    const usersRef = collection(db, 'users');
    
    // Grabs the top 5 students with the highest activityScore
    const q = query(usersRef, orderBy('activityScore', 'desc'), limit(5));
    
    const querySnapshot = await getDocs(q);
    const topStudents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || 'Unknown Student', // Fallback if name is missing
      email: doc.data().email || 'No Email',
      downloads: doc.data().activityScore || 0 // Mapping activityScore to 'downloads' for the table
    }));

    return topStudents;
  } catch (error) {
    console.error("Error fetching top students:", error);
    return []; // Return an empty array so the table doesn't crash if there's an error
  }
};