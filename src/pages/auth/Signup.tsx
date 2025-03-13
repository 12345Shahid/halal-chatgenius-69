
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Mail, Lock, User, Check, AlertCircle } from 'lucide-react';

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: query.get('email') || '',
    password: '',
    termsAccepted: false,
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

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (!formData.termsAccepted) {
      setError('You must accept the terms and conditions.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await signUp(formData.email, formData.password);
      setIsLoading(false);
      // Redirect to login page after successful signup
      navigate('/login');
    } catch (err: any) {
      setIsLoading(false);
      if (err.message.includes('already registered')) {
        setError('This email is already registered. Please log in instead.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
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
          <h1 className="text-2xl font-semibold mt-6 mb-2">Create your account</h1>
          <p className="text-muted-foreground">Join thousands using Halal AI</p>
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
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <User size={18} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Your name"
                  />
                </div>
              </div>
              
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
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 flex gap-2 items-center text-xs">
                  <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-muted'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 10 ? 'bg-green-500' : 'bg-muted'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 12 ? 'bg-green-500' : 'bg-muted'}`}></div>
                  <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                    {formData.password.length === 0 ? 'Password strength' : 
                     formData.password.length < 8 ? 'Too weak' : 
                     formData.password.length < 10 ? 'Good' : 
                     formData.password.length < 12 ? 'Strong' : 'Very strong'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                  />
                </div>
                <div className="ml-2 text-sm">
                  <label htmlFor="termsAccepted" className="text-muted-foreground">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                Create account
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account?</span>{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-primary" />
            <span className="text-sm">Get 20 free credits when you sign up</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-primary" />
            <span className="text-sm">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-primary" />
            <span className="text-sm">Earn more credits by sharing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
