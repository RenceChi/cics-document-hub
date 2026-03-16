// 1. ADD setDoc to your imports at the top
import { collection, addDoc, doc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const logUserAction = async (userId, programId, actionType, metadata = {}) => {
  try {
    const logsRef = collection(db, "activity_logs");
    await addDoc(logsRef, {
      userId,
      programId,
      actionType,
      timestamp: serverTimestamp(),
      ...metadata
    });

    const userRef = doc(db, "users", userId);
    
    if (actionType === "LOGIN") {
      // 2. CHANGED to setDoc with merge: true
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    } 
    
    if (actionType === "FILE_DOWNLOAD") {
      // 3. CHANGED to setDoc with merge: true
      await setDoc(userRef, {
        activityScore: increment(1),
        lastActive: serverTimestamp()
      }, { merge: true });

      if (metadata.documentId) {
        const docRef = doc(db, "documents", metadata.documentId);
        // Documents should always exist if they are downloading them, so updateDoc is fine here
        await updateDoc(docRef, {
          downloadCount: increment(1)
        });
      }
    }
  } catch (error) {
    console.error(`Error logging ${actionType}:`, error);
  }
};