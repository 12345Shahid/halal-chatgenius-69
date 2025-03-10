
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate API call for authentication
    setTimeout(() => {
      // In a real app, check credentials
      const isValidCredentials = formData.email.includes('@') && formData.password.length >= 6;
      
      if (isValidCredentials) {
        // Store session info
        localStorage.setItem('session', 'dummy-token');
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          name: formData.email.split('@')[0],
          credits: 20,
        }));
        
        // Redirect to dashboard or the page they were trying to access
        const redirectTo = new URLSearchParams(location.search).get('redirect');
        navigate(redirectTo || '/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
      
      setIsLoading(false);
    }, 1500);
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
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>
              
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                Sign in
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up for free
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
