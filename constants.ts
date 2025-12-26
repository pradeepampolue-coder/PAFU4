
import { User } from './types';

/**
 * SECURITY NOTICE:
 * Replace the 'email' fields below with your actual Gmail addresses.
 * The passwords provided are high-entropy (strong) and recommended for use.
 */
export const PRE_APPROVED_USERS: User[] = [
  {
    id: 'user_a',
    email: 'sanctuary.alpha@gmail.com', // REPLACE with your first real Gmail
    password: 'Heart-Secure-8842-Alpha!',  // High-security password for User A
    name: 'User A',
    lastLogin: new Date().toISOString(),
    isOnline: true,
    role: 'A'
  },
  {
    id: 'user_b',
    email: 'sanctuary.omega@gmail.com', // REPLACE with your second real Gmail
    password: 'Soul-Private-9921-Omega?',  // High-security password for User B
    name: 'User B',
    lastLogin: new Date().toISOString(),
    isOnline: false,
    role: 'B'
  }
];

/**
 * Secondary authentication for the Private Vault section.
 */
export const VAULT_PASSWORD = 'Sanctuary_Vault_Security_2025#'; 

export const INACTIVITY_TIMEOUT = 1000 * 60 * 10; // 10 minutes (auto-logout)
export const VAULT_TIMEOUT = 1000 * 60 * 5; // 5 minutes (auto-lock vault)
