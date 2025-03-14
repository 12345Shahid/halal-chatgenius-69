
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
        
        // Add a delay to ensure auth user is fully created in the database
        // This helps prevent foreign key constraint errors
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Create new profile with retry logic
        const maxRetries = 3;
        let retryCount = 0;
        let profileCreated = false;
        
        while (retryCount < maxRetries && !profileCreated) {
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
            console.error(`Profile creation attempt ${retryCount + 1} failed:`, profileError.message);
            retryCount++;
            // Wait longer between retries
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.log("User profile created successfully");
            profileCreated = true;
          }
        }
        
        if (!profileCreated) {
          console.error("Failed to create user profile after multiple attempts");
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
      
      // For development, we can disable email confirmation
      const shouldAutoConfirm = true; // Set to true during development
      
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
      
      // In development, we can auto-confirm the user
      if (shouldAutoConfirm && data.user) {
        console.log("Auto-confirming user for development");
        
        // Wait a moment to ensure the user is created
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // For development, manually create the user profile
        // (In production, this would happen after email confirmation)
        try {
          await ensureUserProfile(data.user);
          
          // Try to sign in after creating the profile
          if (shouldAutoConfirm) {
            try {
              // In development, we'll try to sign in directly
              // This simulates a user clicking the confirmation link
              console.log("Auto-signing in the user for development");
              await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
              
              // Use an admin function to auto-confirm the user for development
              const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dev-confirm-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              });
              
              if (response.ok) {
                console.log("User auto-confirmed via edge function");
                
                // Now try to sign in
                await signIn(email, password);
              } else {
                console.log("Could not auto-confirm via edge function, falling back to email confirmation");
                toast.info('Please check your email to confirm your account.');
              }
            } catch (confirmError: any) {
              console.error("Auto-confirmation failed:", confirmError.message);
              toast.info('Please check your email to confirm your account.');
            }
          }
        } catch (profileError: any) {
          console.error('Error in profile creation after signup:', profileError.message);
        }
      } else if (data.session) {
        // User is auto-confirmed
        console.log("User was auto-confirmed, session available");
        
        // Now try to create the user profile
        if (data.user) {
          try {
            // Small delay to ensure auth user is fully created in the database
            await new Promise(resolve => setTimeout(resolve, 2500));
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
