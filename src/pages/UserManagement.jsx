import React, { useEffect, useState } from 'react';
import { collection, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore';
import { ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firebaseApp } from '../lib/firebase';

export const UserManagement = () => {
  const { user, setUserRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [updatingUid, setUpdatingUid] = useState(null);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map((document) => ({ uid: document.id, ...document.data() })));
    }, () => setError('Unable to load users. Confirm the Firestore security rules are deployed.'));
  }, []);

  const changeRole = async (uid, role) => {
    try {
      setError('');
      setUpdatingUid(uid);
      await setUserRole(uid, role);
    } catch {
      setError('Unable to update this role. Your administrator permissions may have changed.');
    } finally {
      setUpdatingUid(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">User Authorization</h2>
        <p className="text-sm text-slate-500">Review signed-in users and assign administrator access.</p>
      </div>
      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-4 text-slate-800"><Users className="h-5 w-5 text-indigo-600" /><h3 className="font-bold">Authorized users</h3></div>
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500"><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4 text-right">Access</th></tr></thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((account) => {
              const isCurrentUser = account.uid === user.uid;
              const isAdmin = account.role === 'admin';
              return <tr key={account.uid}>
                <td className="p-4"><div className="flex items-center gap-3"><img className="h-9 w-9 rounded-full bg-slate-100" src={account.photoURL || undefined} alt="" /><div><p className="font-semibold text-slate-800">{account.displayName || 'Unnamed user'} {isCurrentUser && <span className="text-xs font-normal text-slate-500">(you)</span>}</p><p className="text-xs text-slate-500">{account.email}</p></div></div></td>
                <td className="p-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isAdmin ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>{isAdmin && <ShieldCheck className="h-3.5 w-3.5" />}{isAdmin ? 'Admin' : 'User'}</span></td>
                <td className="p-4 text-right"><button type="button" disabled={updatingUid === account.uid || isCurrentUser} onClick={() => changeRole(account.uid, isAdmin ? 'user' : 'admin')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{updatingUid === account.uid ? 'Updating…' : isAdmin ? 'Remove admin' : 'Make admin'}</button></td>
              </tr>;
            })}
            {users.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-500">No users have signed in yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
