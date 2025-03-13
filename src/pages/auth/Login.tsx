
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user was just redirected from signup page
  const [fromSignup, setFromSignup] = useState(false);
  
  useEffect(() => {
    // Check query params for fromSignup indicator
    const query = new URLSearchParams(location.search);
    setFromSignup(query.get('fromSignup') === 'true');
  }, [location.search]);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Process referral if there's one stored in localStorage
    const processReferral = async () => {
      const referralId = localStorage.getItem('referralId');
      
      if (referralId && user) {
        try {
          // Call the edge function to process the referral
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-referral`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              referrerId: referralId,
              referredId: user.id
            })
          });
          
          const result = await response.json();
          
          if (response.ok) {
            console.log("Referral processed successfully");
            // Clear the stored referral ID
            localStorage.removeItem('referralId');
          } else {
            console.error("Error processing referral:", result.error);
          }
        } catch (error) {
          console.error("Error processing referral:", error);
        }
      }
    };
    
    processReferral();
  }, [user]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
          
          {fromSignup && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
              <p className="text-green-800 text-sm">
                Registration successful! You can now log in with your credentials.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link 
                        to="/reset-password" 
                        className="text-sm text-primary"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary underline">
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
