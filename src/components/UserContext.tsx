import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../supabaseClient';

// User type matching Supabase schema
export interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  last_login: string;
  xp: number;
  level: number;
  bio: string | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);


export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  // Fetch user data from Supabase
  const fetchUser = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      // Update last_login timestamp
      if (data) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('wallet_address', walletAddress);
      }

      return data as User;
    } catch (error) {
      console.error('Error in fetchUser:', error);
      return null;
    }
  };

  // Refresh user data manually
  const refreshUser = async () => {
    if (!address || !isConnected) {
      setUser(null);
      return;
    }

    setLoading(true);
    const userData = await fetchUser(address);
    setUser(userData);
    setLoading(false);
  };

  // Clear user data on logout
  const clearUser = () => {
    setUser(null);
  };

  // Auto-fetch user when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      refreshUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isConnected, address]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}