
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
    }
  };

  // Sign up functionality
  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up with:", email);
      
      // For LOCAL DEVELOPMENT only, we'll bypass the email confirmation
      // In production, this should be properly configured
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
      
      // Create user profile
      if (data.user) {
        try {
          // First check if profile already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (!existingUser) {
            // Create new profile
            const { error: profileError } = await supabase
              .from('users')
              .insert([
                { 
                  id: data.user.id, 
                  email: data.user.email,
                  credits: 20,
                  display_name: data.user.email?.split('@')[0] || 'User'
                }
              ]);
              
            if (profileError) {
              console.error('Error creating user profile:', profileError.message);
            } else {
              console.log("User profile created successfully");
            }
          } else {
            console.log("User profile already exists");
          }
        } catch (profileError: any) {
          console.error('Error in profile creation:', profileError.message);
        }
      }

      // This handles both auto-confirmed and confirmation-required cases
      if (data.session) {
        // User is auto-confirmed
        console.log("User was auto-confirmed, session available");
        toast.success('Account created successfully! Welcome!');
      } else {
        // User needs email confirmation
        console.log("User requires email confirmation");
        toast.success('Registration successful! Please check your email to confirm your account.');
      }
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      toast.error(error.message || 'Error signing up');
      throw error;
    }
  };

  // Sign out functionality
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      toast.success('Successfully signed out');
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      toast.error(error.message || 'Error signing out');
      throw error;
    }
  };

  // Reset password functionality
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      toast.success('Check your email for the password reset link!');
    } catch (error: any) {
      console.error('Reset password error:', error.message);
      toast.error(error.message || 'Error resetting password');
      throw error;
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
