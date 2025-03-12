
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
      // Try to fetch existing credits using direct query since we're having issues with RPC
      const { data, error } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
          
      if (error) {
        if (error.code === 'PGRST116') {
          // If no credits exist, create a new record
          const { data: newCredits, error: createError } = await supabase
            .from('credits')
            .insert({
              user_id: user.id,
              total_credits: 5, // Start with 5 credits
              referral_credits: 0,
              ad_credits: 0
            })
            .select()
            .single();
            
          if (createError) {
            throw createError;
          }
          
          setCredits(newCredits as Credit);
        } else {
          throw error;
        }
      } else {
        setCredits(data as Credit);
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
