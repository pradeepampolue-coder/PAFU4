
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Peer, DataConnection } from 'peerjs';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import LocationSharing from './components/LocationSharing';
import PrivateVault from './components/PrivateVault';
import Calling from './components/Calling';
import { AppView, User, Message, Location, VaultMedia } from './types';
import { PRE_APPROVED_USERS } from './constants';

const App: React.FC = () => {
  // Persistent Login State: Stays logged in until manual sign-out.
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem('sanctuary_session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [locations, setLocations] = useState<Record<string, Location>>({});
  const [vault, setVault] = useState<VaultMedia[]>([]);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'offline' | 'searching' | 'connected'>('offline');

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (currentUser) {
        const view = (event.state?.view as AppView) || 'dashboard';
        setActiveView(view);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  const navigateTo = (view: AppView) => {
    if (view !== activeView) {
      window.history.pushState({ view }, '', '');
      setActiveView(view);
    }
  };

  const getPeerId = (email: string) => {
    // Standardizing prefix and stripping all non-alphanumeric chars
    return `sanct_v6_${email.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  };

  const loadFromStorage = useCallback(() => {
    const savedMessages = localStorage.getItem('pair_messages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    const savedVault = localStorage.getItem('pair_vault');
    if (savedVault) setVault(JSON.parse(savedVault));
    const savedLocations = localStorage.getItem('pair_locations');
    if (savedLocations) setLocations(JSON.parse(savedLocations));
  }, []);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleIncomingData = (data: any) => {
    if (data.type === 'MSG') {
      setMessages(prev => {
        if (prev.some(m => m.id === data.payload.id)) return prev;
        const updated = [...prev, data.payload];
        localStorage.setItem('pair_messages', JSON.stringify(updated));
        return updated;
      });
    } else if (data.type === 'LOC') {
      setLocations(prev => {
        const updated = { ...prev, [data.senderId]: data.payload };
        localStorage.setItem('pair_locations', JSON.stringify(updated));
        return updated;
      });
    } else if (data.type === 'CLEAR_CHAT') {
      setMessages([]);
      localStorage.setItem('pair_messages', JSON.stringify([]));
    }
  };

  // Improved PeerJS Lifecycle
  useEffect(() => {
    if (!currentUser) {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      return;
    }

    const myId = getPeerId(currentUser.email);
    const otherUser = PRE_APPROVED_USERS.find(u => u.id !== currentUser.id)!;
    const partnerId = getPeerId(otherUser.email);

    // Initializing Peer with silence to minimize error logs
    const peer = new Peer(myId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
      },
      debug: 0 // Reduced debug level to avoid noisy error overlays
    });

    peerRef.current = peer;
    setConnectionStatus('searching');

    const setupConnection = (conn: DataConnection) => {
      if (connRef.current && connRef.current.open) return;
      connRef.current = conn;
      
      conn.on('open', () => {
        setIsOtherUserOnline(true);
        setConnectionStatus('connected');
        if (heartbeatIntervalRef.current) window.clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = window.setInterval(() => {
          if (conn.open) conn.send({ type: 'HEARTBEAT' });
        }, 5000);
      });

      conn.on('data', handleIncomingData);
      
      conn.on('close', () => {
        setIsOtherUserOnline(false);
        setConnectionStatus('searching');
        connRef.current = null;
      });

      conn.on('error', () => {
        setIsOtherUserOnline(false);
        setConnectionStatus('searching');
      });
    };

    peer.on('open', (id) => {
      console.log('Sanctuary Peer Online:', id);
      
      const attemptConnection = () => {
        // Only attempt if not already connected and peer is valid
        if (peer && !peer.destroyed && (!connRef.current || !connRef.current.open)) {
          try {
            const conn = peer.connect(partnerId, { reliable: true });
            setupConnection(conn);
          } catch (e) {
            // Silently fail if connection attempt is impossible
          }
        }
      };

      attemptConnection();
      const interval = window.setInterval(attemptConnection, 15000); // 15s interval for stability
      return () => window.clearInterval(interval);
    });

    peer.on('connection', setupConnection);
    
    peer.on('call', (call) => {
      setActiveCall(call);
      setIsIncomingCall(true);
    });

    peer.on('error', (err) => {
      // Handling 'peer-unavailable' silently as it's normal behavior when partner is offline
      if (err.type === 'peer-unavailable' || err.type === 'connection-closed' || err.type === 'disconnected') {
        setConnectionStatus('searching');
        setIsOtherUserOnline(false);
      } else {
        console.warn('Sanctuary Peer Alert:', err.type);
      }
    });

    return () => {
      peer.destroy();
      if (heartbeatIntervalRef.current) window.clearInterval(heartbeatIntervalRef.current);
    };
  }, [currentUser]);

  const handleLogout = useCallback(() => {
    if (confirm("Sign out of your private sanctuary?")) {
      localStorage.removeItem('sanctuary_session');
      setCurrentUser(null);
      window.history.replaceState(null, '', '/');
    }
  }, []);

  const handleLogin = (email: string) => {
    const user = PRE_APPROVED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const loggedUser = { ...user, lastLogin: new Date().toISOString(), isOnline: true };
      setCurrentUser(loggedUser);
      localStorage.setItem('sanctuary_session', JSON.stringify(loggedUser));
      window.history.pushState({ view: 'dashboard' }, '', '');
    }
  };

  const sendMessage = (text: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      text,
      timestamp: Date.now(),
      read: false
    };
    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem('pair_messages', JSON.stringify(updated));
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: 'MSG', payload: newMessage, senderId: currentUser.id });
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.setItem('pair_messages', JSON.stringify([]));
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: 'CLEAR_CHAT' });
    }
  };

  const updateLocation = (loc: Location) => {
    if (!currentUser) return;
    const updatedLocations = { ...locations, [currentUser.id]: loc };
    setLocations(updatedLocations);
    localStorage.setItem('pair_locations', JSON.stringify(updatedLocations));
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: 'LOC', payload: loc, senderId: currentUser.id });
    }
  };

  const addToVault = (media: VaultMedia) => {
    const updated = [...vault, media];
    setVault(updated);
    localStorage.setItem('pair_vault', JSON.stringify(updated));
  };

  const removeFromVault = (id: string) => {
    const updated = vault.filter(m => m.id !== id);
    setVault(updated);
    localStorage.setItem('pair_vault', JSON.stringify(updated));
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const otherUser = PRE_APPROVED_USERS.find(u => u.id !== currentUser.id)!;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="max-w-xl mx-auto pb-24">
        {activeView === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser} 
            otherUser={{ ...otherUser, isOnline: isOtherUserOnline }} 
            onNavigate={navigateTo} 
          />
        )}
        {activeView === 'chat' && (
          <Chat 
            messages={messages} 
            onSend={sendMessage} 
            onClear={clearChat} 
            currentUserId={currentUser.id} 
            onBack={() => window.history.back()} 
          />
        )}
        {activeView === 'location' && (
          <LocationSharing 
            locations={locations} 
            onUpdate={updateLocation} 
            otherUser={otherUser} 
            currentUserId={currentUser.id} 
            onBack={() => window.history.back()} 
          />
        )}
        {activeView === 'vault' && (
          <PrivateVault 
            media={vault} 
            onAdd={addToVault} 
            onRemove={removeFromVault} 
            onBack={() => window.history.back()} 
          />
        )}
        {activeView === 'calling' && (
          <Calling 
            isIncoming={false} 
            onClose={() => window.history.back()} 
            callerName={otherUser.name} 
            peer={peerRef.current}
            targetPeerId={getPeerId(otherUser.email)}
          />
        )}
        {isIncomingCall && (
          <Calling 
            isIncoming={true} 
            onClose={() => setIsIncomingCall(false)} 
            callerName={otherUser.name} 
            onAccept={(stream) => {
              if (activeCall) {
                activeCall.answer(stream);
                setIsIncomingCall(false);
                navigateTo('calling');
              }
            }}
          />
        )}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center p-4 z-50 pb-8">
         <button onClick={() => navigateTo('dashboard')} className={`p-2 transition-all active:scale-90 ${activeView === 'dashboard' ? 'text-rose-500' : 'text-slate-500'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
         </button>
         <button onClick={() => navigateTo('chat')} className={`p-2 transition-all active:scale-90 ${activeView === 'chat' ? 'text-rose-500' : 'text-slate-500'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
         </button>
         <button onClick={() => navigateTo('location')} className={`p-2 transition-all active:scale-90 ${activeView === 'location' ? 'text-rose-500' : 'text-slate-500'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
         </button>
         <button onClick={() => navigateTo('vault')} className={`p-2 transition-all active:scale-90 ${activeView === 'vault' ? 'text-rose-500' : 'text-slate-500'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
         </button>
         <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-400 active:scale-90">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
         </button>
      </nav>
    </div>
  );
};

export default App;
