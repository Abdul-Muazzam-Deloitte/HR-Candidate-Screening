export interface User {
  id: string;
  email: string;
  name: string;
  role: 'hr' | 'candidate';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, role: 'hr' | 'candidate') => Promise<boolean>;
  signOut: () => void;
}