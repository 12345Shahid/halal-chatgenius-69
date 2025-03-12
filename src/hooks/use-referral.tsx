
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useReferral = () => {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState<string>('');

  useEffect(() => {
    if (user) {
      setReferralLink(`${window.location.origin}/signup?ref=${user.id}`);
    }
  }, [user]);

  return { referralLink };
};
