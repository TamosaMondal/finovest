// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Ensure this path is correct

// Interface for the user profile data stored in Firestore
interface UserProfile {
  name: string;
  phoneNumber: string;
  createdAt: Date;
}

// The shape of the data provided by our context
interface AuthContextType {
  currentUser: User | null; // The raw user object from Firebase Auth
  userProfile: UserProfile | null; // The user's profile data from Firestore
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is the core of our auth state management.
    // It listens for any changes in the user's login status.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // If the user is logged in, fetch their profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          // This case might happen if a user is authenticated but their
          // profile document wasn't created, e.g., an incomplete signup.
          setUserProfile(null);
        }
      } else {
        // If the user is logged out, clear their profile data
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    logout,
  };

  // We only render the rest of the app once we're done loading the user's status
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}