
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle
} from "lucide-react";

const Login = () => {
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  
  const [email, setEmail] = useState(state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", email);
      
      // Check if the email has been confirmed (for development testing)
      // This is a temporary solution for development environments where email confirmation might not be set up
      const isEmailConfirmed = await checkEmailConfirmation(email);
      
      if (!isEmailConfirmed) {
        // If email is not confirmed, show a friendly message
        setError("Please check your email inbox to confirm your account first.");
        setIsLoading(false);
        return;
      }
      
      await signIn(email, password);
      
      // This part should only execute if signIn was successful
      console.log("Login successful, checking redirect");
      
      // Redirect to dashboard or the page they were trying to access
      const redirectTo = state?.redirectTo || "/dashboard";
      console.log("Redirecting to:", redirectTo);
      
      navigate(redirectTo, { 
        state: { 
          ...(state?.prompt ? { prompt: state.prompt } : {}) 
        } 
      });
    } catch (err: any) {
      console.error("Login error:", err);
      
      if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Please verify your email before logging in.");
      } else if (err.message?.includes("Failed to fetch")) {
        setError("Connection error. Please check your internet connection and try again.");
      } else {
        setError(err.message || "An error occurred during login.");
      }
      
      setIsLoading(false);
    }
  };
  
  // Development helper function to check if email has been confirmed
  // In a production environment, this would be handled by the actual email confirmation flow
  const checkEmailConfirmation = async (email: string): Promise<boolean> => {
    try {
      // For development, we'll assume the email is confirmed after a certain time
      // In production, this would be handled by the actual email confirmation
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If we already have a session, the email is confirmed
        return true;
      }
      
      // In development, we can use a direct API call to check if the user exists and is confirmed
      // This is just for development purposes - in production, rely on proper email confirmation
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-email-confirmed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.confirmed;
      }
      
      // Fall back to assuming the email is confirmed for development
      return true;
    } catch (error) {
      console.error("Error checking email confirmation:", error);
      // For development, assume the email is confirmed to allow login testing
      return true;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <span className="text-2xl font-semibold">HalalChat</span>
            <span className="text-primary ml-1 text-2xl">AI</span>
          </Link>
          
          <h1 className="text-2xl font-semibold mt-6 mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>
        
        <div className="bg-background rounded-xl shadow-elevated border border-border p-8">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 flex items-start gap-2 mb-6">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link 
                    to="/reset-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                isLoading={isLoading || authLoading}
                className="w-full"
              >
                Sign in
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
