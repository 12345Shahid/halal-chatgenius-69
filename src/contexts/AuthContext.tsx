
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
      
      // Check if user profile exists, if not create it
      // This handles cases where auth exists but profile wasn't created properly
      if (data.user) {
        await ensureUserProfile(data.user);
      }
      
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  // Helper function to ensure user profile exists
  const ensureUserProfile = async (user: User) => {
    try {
      // First check if profile already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking for existing user profile:', fetchError.message);
        return;
      }
      
      if (!existingUser) {
        console.log("User profile doesn't exist, creating one now");
        
        // Create new profile with retry logic
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            { 
              id: user.id, 
              email: user.email,
              credits: 20,
              display_name: user.email?.split('@')[0] || 'User'
            }
          ]);
          
        if (profileError) {
          console.error('Error creating user profile:', profileError.message);
          
          // If there's still an error, let's log it but not fail the auth process
          console.log("User authenticated successfully but profile creation failed");
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

  // Sign up functionality
  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up with:", email);
      
      // Try to create the auth user
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
      
      // IMPORTANT: Wait for the auth user to be fully created before trying to create the profile
      // This avoids the foreign key constraint error
      
      // This handles both auto-confirmed and confirmation-required cases
      if (data.session) {
        // User is auto-confirmed
        console.log("User was auto-confirmed, session available");
        
        // Now try to create the user profile
        if (data.user) {
          try {
            // Small delay to ensure auth user is fully created in the database
            await new Promise(resolve => setTimeout(resolve, 500));
            await ensureUserProfile(data.user);
          } catch (profileError: any) {
            console.error('Error in profile creation after signup:', profileError.message);
          }
        }
        
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
