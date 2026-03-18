import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tier, setTier] = useState("FREE");

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setTier(snap.data().tier || "FREE");
        }
      } else {
        setUser(null);
        setTier("FREE");
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, tier }}>
      {children}
    </AuthContext.Provider>
  );
}
