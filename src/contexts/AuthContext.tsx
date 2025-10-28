import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', storedUserId)
        .eq('role', 'user')
        .eq('status', 'active')
        .maybeSingle();

      if (!error && data) {
        setUser({
          id: data.id,
          email: data.email,
          firstName: data.full_name.split(' ')[0] || data.full_name,
          lastName: data.full_name.split(' ').slice(1).join(' ') || '',
          phone: data.phone || '',
          createdAt: data.created_at,
        });
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'user')
        .eq('status', 'active')
        .maybeSingle();

      if (error || !userData) {
        console.log('User not found or error:', error);
        return false;
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.full_name.split(' ')[0] || userData.full_name,
        lastName: userData.full_name.split(' ').slice(1).join(' ') || '',
        phone: userData.phone || '',
        createdAt: userData.created_at,
      };

      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      setUser(user);
      localStorage.setItem('userId', userData.id);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Starting signup process for:', userData.email);

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingUser) {
        console.log('User already exists');
        return false;
      }

      const fullName = `${userData.firstName} ${userData.lastName}`.trim();
      console.log('Creating new user:', fullName, userData.email);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            email: userData.email,
            full_name: fullName,
            phone: userData.phone,
            role: 'user',
            status: 'active',
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Signup error:', error);
        return false;
      }

      console.log('User created successfully:', newUser.id);

      const user: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        createdAt: newUser.created_at,
      };

      setUser(user);
      localStorage.setItem('userId', newUser.id);
      console.log('User logged in automatically');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updates: any = {};

      if (userData.firstName || userData.lastName) {
        const firstName = userData.firstName || user.firstName;
        const lastName = userData.lastName || user.lastName;
        updates.full_name = `${firstName} ${lastName}`.trim();
      }

      if (userData.phone !== undefined) {
        updates.phone = userData.phone;
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error:', error);
        return false;
      }

      setUser({ ...user, ...userData });
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
