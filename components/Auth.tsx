
import React, { useState } from 'react';
import { PRE_APPROVED_USERS } from '../constants';

interface AuthProps {
  onLogin: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find the user by the entered email
    const user = PRE_APPROVED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      setError("This account is not authorized.");
      return;
    }

    // Verify the password against the one stored in constants.ts for that specific user
    if (password === user.password) {
      onLogin(user.email);
    } else {
      setError("Incorrect password.");
      setPassword(''); // Clear password field on error
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-rose-500 mb-2">Two of Us</h1>
          <p className="text-slate-400 font-light">Your private digital sanctuary</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-medium mb-6 text-slate-200 text-center">Identity Verification</h2>
          
          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Private Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Secret Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-10 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-950/40 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            Enter Sanctuary
          </button>

          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="h-[1px] w-12 bg-slate-800"></div>
            <p className="text-center text-slate-600 text-[9px] uppercase tracking-widest leading-loose">
              Access Restricted to<br/>Two Authorized Heartbeats
            </p>
          </div>
        </form>

        <div className="mt-12 text-center">
           <span className="inline-flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-[0.3em] opacity-50">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
             End-to-End Private
           </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
