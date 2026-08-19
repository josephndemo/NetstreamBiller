import React, { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onIdTokenChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { apiRequest } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onIdTokenChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      try {
        const profile = await apiRequest('/api/me');
        setIsAdmin(profile.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase is not configured.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email, password) => {
    if (!auth) throw new Error('Firebase is not configured.');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const createAccount = async (name, email, password) => {
    if (!auth) throw new Error('Firebase is not configured.');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
  };

  const resetPassword = async (email) => {
    if (!auth) throw new Error('Firebase is not configured.');
    await sendPasswordResetEmail(auth, email);
  };

  const signOutUser = () => signOut(auth);

  const setUserRole = async (uid, role) => {
    await apiRequest(`/api/users/${uid}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, isFirebaseConfigured, signInWithGoogle, signInWithEmail, createAccount, resetPassword, signOutUser, setUserRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
};
