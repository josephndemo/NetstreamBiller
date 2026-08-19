import React, { useState } from 'react';
import { Chrome, LockKeyhole, UserPlus, Wifi } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignIn = () => {
  const { isFirebaseConfigured, signInWithGoogle, signInWithEmail, createAccount, resetPassword } = useAuth();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (authError) {
      const messages = {
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.',
        'auth/operation-not-allowed': 'Google sign-in is not enabled. In Firebase Console, enable Authentication → Sign-in method → Google.',
        'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Add localhost to Authentication → Settings → Authorized domains.',
        'auth/invalid-api-key': 'The Firebase API key is invalid. Check the Firebase Web App configuration in .env.local.',
        'auth/network-request-failed': 'The sign-in request could not reach Firebase. Check your network connection and try again.',
      };
      setError(messages[authError.code] || `Google sign-in failed (${authError.code || 'unknown error'}).`);
    }
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setMessage('');
      if (isCreatingAccount) await createAccount(name, email, password);
      else await signInWithEmail(email, password);
    } catch (authError) {
      const messages = {
        'auth/email-already-in-use': 'An account already exists for that email address.',
        'auth/invalid-credential': 'Incorrect email address or password.',
        'auth/weak-password': 'Use a password with at least 6 characters.',
      };
      setError(messages[authError.code] || 'Unable to continue. Please try again.');
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    try {
      setError('');
      await resetPassword(email);
      setMessage('If an account exists, a password reset email has been sent.');
    } catch {
      setMessage('If an account exists, a password reset email has been sent.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto w-fit rounded-xl bg-indigo-600 p-3"><Wifi className="h-8 w-8 text-white" /></div>
          <h1 className="text-2xl font-bold text-slate-900">NetStream</h1>
          <p className="text-sm text-slate-500">{isCreatingAccount ? 'Create an account for ISP billing and operations.' : 'Sign in to access ISP billing and operations.'}</p>
        </div>
        {!isFirebaseConfigured && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Firebase has not been configured. Copy <code>.env.example</code> to <code>.env.local</code> and add your web-app credentials.</p>
        )}
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {isCreatingAccount && <div><label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Full name</label><input id="name" required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>}
          <div><label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email address</label><input id="email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label><input id="password" required minLength="6" type="password" autoComplete={isCreatingAccount ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <button type="submit" disabled={!isFirebaseConfigured} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300">{isCreatingAccount ? <UserPlus className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}{isCreatingAccount ? 'Create account' : 'Sign in'}</button>
        </form>
        <div className="flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-medium uppercase tracking-wide text-slate-400">or</span><div className="h-px flex-1 bg-slate-200" /></div>
        <button type="button" onClick={handleSignIn} disabled={!isFirebaseConfigured} className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"><Chrome className="h-5 w-5" /> {isCreatingAccount ? 'Sign up with Google' : 'Continue with Google'}</button>
        <div className="flex items-center justify-between text-sm"><button type="button" onClick={() => { setIsCreatingAccount(!isCreatingAccount); setError(''); setMessage(''); }} className="font-medium text-indigo-600 hover:text-indigo-700">{isCreatingAccount ? 'Already have an account?' : 'Create an account'}</button>{!isCreatingAccount && <button type="button" onClick={handlePasswordReset} className="text-slate-500 hover:text-slate-700">Forgot password?</button>}</div>
      </section>
    </main>
  );
};
