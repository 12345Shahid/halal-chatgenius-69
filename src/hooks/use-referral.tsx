
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useReferral = (referralCode?: string | null) => {
  const { user } = useAuth();

  useEffect(() => {
    // Process referral only when both referral code and user are available
    const processReferral = async () => {
      if (!referralCode || !user || referralCode === user.id) return;

      try {
        // Call the edge function to handle the referral
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-referral`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.getSession()}`
          },
          body: JSON.stringify({
            referrerId: referralCode,
            referredId: user.id
          })
        });

        if (!response.ok) {
          console.error('Error processing referral:', await response.json());
        }
      } catch (error) {
        console.error('Error processing referral:', error);
      }
    };

    if (referralCode && user) {
      processReferral();
    }
  }, [referralCode, user]);
};
