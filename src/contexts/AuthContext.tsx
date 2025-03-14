
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

  // Helper function to ensure user profile exists
  const ensureUserProfile = async (user: User) => {
    try {
      // First check if profile already exists
      console.log("Checking if user profile exists for:", user.id);
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
        
        // For auth created users, we need to ensure the user exists in auth before
        // trying to create a profile with a foreign key reference
        // First, check if the user exists in auth
        const { data: authUser } = await supabase.auth.getUser();
        
        if (!authUser || !authUser.user) {
          console.log("Auth user not found yet, waiting before creating profile");
          // The user might not be fully created in auth yet, wait a bit longer
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        // Now create the profile
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
          console.error('Profile creation failed:', profileError.message);
          // If the error is a foreign key constraint, the user might not be fully
          // created in auth yet. We'll let the user know to try again later.
          if (profileError.message.includes('foreign key constraint')) {
            toast.error('Account created but profile setup failed. Please try logging in later.');
          }
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

  // Sign in functionality
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with:", email);
      setLoading(true);
      
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
      
      // If we get a user but no session, it means email confirmation is required
      if (data.user && !data.session) {
        toast.success('Registration successful! Please check your email to confirm your account.');
        // Redirect to login with email prefilled
        return;
      }
      
      // If we have both user and session, user is auto-confirmed
      if (data.user && data.session) {
        console.log("User was auto-confirmed, session available");
        
        // Try to create the user profile, but don't worry if it fails
        // they can try signing in later
        try {
          await ensureUserProfile(data.user);
          toast.success('Account created successfully! Welcome!');
        } catch (profileError: any) {
          console.error('Error in profile creation after signup:', profileError.message);
          // Still show success since auth is created
          toast.success('Account created! Please sign in.');
        }
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
