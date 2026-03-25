import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Update user status to online
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        await setDoc(userRef, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Duck User",
          photoURL: firebaseUser.photoURL,
          online: true,
          lastSeen: serverTimestamp(),
          createdAt: userSnap.exists() ? userSnap.data().createdAt : serverTimestamp()
        }, { merge: true });

        // Offline logic (works partially via JS window unload, better handled via RTDB presence if we had it)
        window.addEventListener("beforeunload", () => {
          setDoc(userRef, { online: false, lastSeen: serverTimestamp() }, { merge: true });
        });

        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
