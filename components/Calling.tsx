
import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';

interface CallingProps {
  isIncoming: boolean;
  onClose: () => void;
  callerName: string;
  onAccept?: (stream: MediaStream) => void;
  peer?: Peer | null;
  targetPeerId?: string;
}

const Calling: React.FC<CallingProps> = ({ isIncoming, onClose, callerName, onAccept, peer, targetPeerId }) => {
  const [status, setStatus] = useState<'ringing' | 'connected'>('ringing');
  const [timer, setTimer] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: number;
    if (status === 'connected') {
      interval = window.setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Handle call logic
  useEffect(() => {
    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        if (!isIncoming && peer && targetPeerId) {
          const call = peer.call(targetPeerId, stream);
          call.on('stream', (rStream) => {
            setStatus('connected');
            setRemoteStream(rStream);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
          });
        }
      } catch (err) {
        console.error("Failed to get media stream", err);
        alert("Please enable camera and microphone permissions.");
        onClose();
      }
    };

    if (!isIncoming) startCall();
  }, [isIncoming, peer, targetPeerId]);

  const handleAcceptClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (onAccept) onAccept(stream);
      setStatus('connected');
    } catch (err) {
      alert("Permission denied.");
      onClose();
    }
  };

  const handleEndCall = () => {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    onClose();
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between p-6 animate-in fade-in duration-500 overflow-hidden">
      {status === 'connected' && (
        <div className="absolute inset-0 flex flex-col bg-black">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 right-6 w-32 h-44 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl z-10">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="relative z-20 mt-20 flex flex-col items-center">
        {status === 'ringing' && (
          <div className="relative mb-12">
            <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 relative z-10">
              <svg className="w-16 h-16 text-rose-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-pulse-ring"></div>
            <div className="absolute inset-0 rounded-full bg-rose-500/10 animate-pulse-ring delay-700"></div>
          </div>
        )}
        
        <h2 className="text-4xl font-serif font-bold text-white mb-3 drop-shadow-lg">{callerName}</h2>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-rose-500'} animate-pulse`}></span>
          <span className="text-rose-500 uppercase tracking-[0.2em] text-[11px] font-bold">
            {status === 'ringing' ? (isIncoming ? 'Incoming...' : 'Calling...') : `Live • ${formatTime(timer)}`}
          </span>
        </div>
      </div>

      <div className="relative z-20 mb-20 w-full max-w-sm flex items-center justify-around">
        {status === 'ringing' && isIncoming ? (
          <>
            <button 
              onClick={handleEndCall}
              className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-rose-950/60 transition-transform active:scale-90"
            >
              <svg className="w-10 h-10 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"/></svg>
            </button>
            <button 
              onClick={handleAcceptClick}
              className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-950/60 transition-transform active:scale-90"
            >
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"/></svg>
            </button>
          </>
        ) : (
          <button 
            onClick={handleEndCall}
            className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-rose-950/60 transition-transform active:scale-90"
          >
            <svg className="w-10 h-10 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"/></svg>
          </button>
        )}
      </div>

      <div className="absolute bottom-10 z-20 text-[10px] text-slate-500 uppercase tracking-widest font-bold px-12 text-center opacity-60">
        Direct Peer-to-Peer encrypted stream
      </div>
    </div>
  );
};

export default Calling;
