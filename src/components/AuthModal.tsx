// src/components/AuthModal.tsx

import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut 
} from "firebase/auth";
import { auth, db } from '../firebase'; // Ensure path is correct
import { doc, setDoc } from "firebase/firestore"; 

import { Mail, Lock, User, Shield, X, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // **NEW**: State to manage the "Awaiting Verification" screen
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  if (!isOpen) return null;

  const handleAuthAction = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name for signup.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        // --- SIGN UP LOGIC ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await sendEmailVerification(user);
        
        // Sign the user out immediately so they can't proceed
        await signOut(auth); 
        
        // Save user profile to Firestore in the background
        await setDoc(doc(db, "users", user.uid), {
          name: name.trim(),
          email: user.email,
          createdAt: new Date()
        });

        // **NEW**: Switch to the verification screen
        setAwaitingVerification(true);

      } else {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
          await signOut(auth); // Sign them out again
          setError('Your email is not verified yet. Please check your inbox for the verification link.');
          return; // Stop the function
        }
        
        // If verified, close the modal and reset
        onClose();
        resetForm();
      }

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please log in.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error("Firebase Auth Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setMode('login');
    // **NEW**: Reset the verification state
    setAwaitingVerification(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        
        {/* **NEW**: Conditional rendering for the verification screen */}
        {awaitingVerification ? (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Please Verify Your Email</h2>
            <p className="text-gray-600 mt-2">
              We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to continue.
            </p>
            <button
              onClick={() => {
                setAwaitingVerification(false);
                setMode('login'); // Switch to login mode so they can try signing in
              }}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              I've Verified My Email
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === 'login' ? 'Login' : 'Sign Up'}
                </h2>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <button
                onClick={handleAuthAction}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
              </button>

              <div className="text-center">
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
