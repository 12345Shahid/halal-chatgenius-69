
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Credit } from '@/types/credit';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<Credit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First try to fetch the user record which contains credits
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
          
      if (error) {
        throw error;
      } 
      
      if (data) {
        // Convert the users table data to match our Credit type 
        const creditData: Credit = {
          id: data.id,
          user_id: data.id,
          total_credits: data.credits || 0,
          referral_credits: 0, // Not stored directly in users table
          ad_credits: 0, // Not stored directly in users table
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setCredits(creditData);
      } else {
        // If no user record exists with credits, this is an error state
        throw new Error('User credit record not found');
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching credits:', err);
      toast.error('Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  return { credits, loading, error, refetch: fetchCredits };
};
