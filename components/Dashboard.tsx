
import React from 'react';
import { User, AppView } from '../types';

interface DashboardProps {
  currentUser: User;
  otherUser: User;
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, otherUser, onNavigate }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-slate-400 text-sm font-light mb-1">Welcome, {currentUser.name}</h2>
          <h1 className="text-3xl font-serif font-bold text-rose-500">Sanctuary</h1>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${otherUser.isOnline ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-slate-700'}`}></span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              {otherUser.name} {otherUser.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 uppercase tracking-tighter">Direct P2P Tunnel Active</span>
        </div>
      </header>

      <section className="relative h-56 bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl group">
        <img 
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1000" 
          alt="Shared memory" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        <div className="absolute bottom-8 left-8">
          <h3 className="text-2xl font-serif font-bold text-white mb-2">Our Space</h3>
          <p className="text-slate-400 text-xs italic tracking-wide">"Private. Real-time. Always us."</p>
        </div>
        {otherUser.isOnline && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Live Sync</span>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-5">
        <button 
          onClick={() => onNavigate('chat')}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-4 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 group relative"
        >
          <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
            <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Messages</span>
        </button>

        <button 
          onClick={() => onNavigate('location')}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-4 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 group"
        >
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Live GPS</span>
        </button>

        <button 
          onClick={() => onNavigate('vault')}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-4 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 group"
        >
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
            <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Media Vault</span>
        </button>

        <button 
          onClick={() => onNavigate('calling')}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-4 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 group"
        >
          <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z"/></svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Live Call</span>
        </button>
      </div>

      <footer className="bg-slate-900/30 p-6 rounded-[2rem] border border-slate-800/50">
        <div className="flex items-center gap-3 mb-4">
           <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
           <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">End-to-End Encryption</h4>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed italic">
          Your messages travel directly between your phone and laptop using WebRTC. 
          No third party, no database, no central server ever sees your conversation.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
