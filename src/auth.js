import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";

export const loginWithNEU = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Secure the gates: Check for the required domain
    if (!user.email.endsWith('@neu.edu.ph')) {
      await signOut(auth); // Immediately sign them back out
      throw new Error("Unauthorized: Please use your @neu.edu.ph email address.");
    }

    return user;
  } catch (error) {
    console.error("Login failed:", error.message);
    // Handle UI error display here
    return null;
  }
};