import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session on app load
    const storedUser = localStorage.getItem('hr_screening_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('hr_screening_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get stored users
    const storedUsers = JSON.parse(localStorage.getItem('hr_screening_users') || '[]');
    const foundUser = storedUsers.find((u: User) => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('hr_screening_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signUp = async (email: string, password: string, name: string, role: 'hr' | 'candidate'): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get existing users
    const storedUsers = JSON.parse(localStorage.getItem('hr_screening_users') || '[]');
    
    // Check if user already exists
    if (storedUsers.some((u: User) => u.email === email)) {
      setIsLoading(false);
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    
    // Store user
    storedUsers.push(newUser);
    localStorage.setItem('hr_screening_users', JSON.stringify(storedUsers));
    
    setUser(newUser);
    localStorage.setItem('hr_screening_user', JSON.stringify(newUser));
    
    setIsLoading(false);
    return true;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('hr_screening_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};