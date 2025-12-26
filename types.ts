
export interface User {
  id: string;
  email: string;
  password?: string; // Added for simplified simulation authentication
  name: string;
  lastLogin: string;
  isOnline: boolean;
  role: 'A' | 'B';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  isActive: boolean;
}

export interface VaultMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  timestamp: number;
}

export type AppView = 'dashboard' | 'chat' | 'location' | 'vault' | 'calling';

export interface AppState {
  currentUser: User | null;
  otherUser: User | null;
  messages: Message[];
  locations: Record<string, Location>;
  vault: VaultMedia[];
  vaultUnlocked: boolean;
}
