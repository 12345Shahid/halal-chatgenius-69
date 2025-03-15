
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define what our auth context will contain
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create the context with undefined as default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session fetched:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in functionality
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with:", email);
      setLoading(true);
      
      // Now try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error.message);
        throw error;
      }
      
      console.log("Sign in successful:", data?.user?.email);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      toast.error(error.message || 'Error signing in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up functionality
  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up with:", email);
      setLoading(true);
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            credits: 20, // Give new users 20 credits
          }
        }
      });
      
      if (error) {
        console.error("Sign up error:", error.message);
        throw error;
      }
      
      console.log("Sign up response:", data);
      
      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Account created! Please check your email to confirm your account.');
      } else {
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please log in instead.');
      } else {
        toast.error(error.message || 'Error signing up');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out functionality
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      toast.success('Successfully signed out');
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      toast.error(error.message || 'Error signing out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password functionality
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      toast.success('Check your email for the password reset link!');
    } catch (error: any) {
      console.error('Reset password error:', error.message);
      toast.error(error.message || 'Error resetting password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Provide the auth context
  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}