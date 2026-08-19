import React from 'react';
import { Bell, LogOut, Search, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, signOutUser } = useAuth();
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search subscriber, IP, or invoice..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-500 hover:text-slate-700 relative rounded-full hover:bg-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center space-x-3">
          <UserCircle className="w-8 h-8 text-slate-400" />
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">{user.displayName || 'User'}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <button type="button" onClick={signOutUser} title="Sign out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </header>
  );
};
