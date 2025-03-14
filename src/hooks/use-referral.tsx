
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useReferral = () => {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Generate referral link
      setReferralLink(`${window.location.origin}/signup?ref=${user.id}`);
      
      // Fetch referral count
      fetchReferralCount();
    } else {
      // Clear referral data when not logged in
      setReferralLink('');
      setReferralCount(0);
    }
  }, [user]);

  const fetchReferralCount = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching referral count for user:", user.id);
      const { data, error } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', user.id);
      
      if (error) {
        console.error("Error fetching referral count:", error);
        setError("Failed to fetch referral data");
        return;
      }
      
      console.log("Referral count data:", data);
      setReferralCount(data?.length || 0);
    } catch (err) {
      console.error("Exception in fetchReferralCount:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralLink) {
      toast.error("You must be logged in to share your referral link");
      return;
    }
    
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        toast.success("Referral link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy referral link:", err);
        toast.error("Failed to copy referral link");
      });
  };

  const processReferral = async (referrerId: string, referredId: string) => {
    try {
      console.log("Processing referral:", { referrerId, referredId });
      
      // First check if the user has a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session for API call");
        return { success: false, error: "Authentication required" };
      }
      
      // Call the edge function to process the referral
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-referral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          referrerId,
          referredId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Error processing referral:", data.error);
        return { success: false, error: data.error };
      }
      
      console.log("Referral processed successfully:", data);
      
      // Refresh the referral count after successful processing
      if (user) {
        fetchReferralCount();
      }
      
      return { success: true };
    } catch (err) {
      console.error("Exception in processReferral:", err);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  return { 
    referralLink, 
    referralCount, 
    isLoading, 
    error, 
    copyReferralLink, 
    processReferral,
    refreshReferralCount: fetchReferralCount 
  };
};
