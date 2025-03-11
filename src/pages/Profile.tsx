
import { useState, useEffect } from 'react';
import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    language: 'en',
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch profile data from Supabase
        // For now, we'll use placeholder data
        setTimeout(() => {
          setFormData({
            displayName: user.email?.split('@')[0] || '',
            bio: 'Halal content creator',
            location: 'Kuala Lumpur, Malaysia',
            website: '',
            language: 'en',
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // In a real implementation, we would update profile data in Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-8 w-64 bg-secondary rounded mx-auto mb-4"></div>
            <div className="h-4 w-32 bg-secondary rounded mx-auto"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Your Profile</h1>
            <p className="text-lg text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">
                      {formData.displayName ? formData.displayName[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                  <h3 className="font-medium text-lg">{formData.displayName || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{formData.location || 'Not specified'}</span>
                  </p>
                  
                  {formData.website && (
                    <p className="text-sm flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {formData.website.replace(/^https?:\/\//, '')}
                      </a>
                    </p>
                  )}
                </div>
                
                <div className="border-t border-border mt-6 pt-6">
                  <h4 className="font-medium mb-2">Referral Link</h4>
                  <div className="bg-secondary p-2 rounded text-xs break-all">
                    https://halalchat.ai/signup?ref={user?.id}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://halalchat.ai/signup?ref=${user?.id}`);
                      toast.success('Referral link copied to clipboard');
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-medium mb-4">Account Menu</h3>
                <ul className="space-y-2">
                  <li className="bg-accent/50 rounded-md">
                    <button className="w-full text-left px-3 py-2 rounded-md font-medium">
                      Profile Settings
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/20">
                      Security
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/20">
                      Notifications
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/20">
                      Billing
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-medium mb-6">Profile Settings</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-secondary/50 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your email cannot be changed
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium mb-1">
                        Website
                      </label>
                      <input
                        id="website"
                        name="website"
                        type="url"
                        placeholder="https://"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium mb-1">
                      Preferred Language
                    </label>
                    <select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" isLoading={isSaving}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border mt-6">
                <h2 className="text-xl font-medium mb-6">Connected Accounts</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#4285F4] flex items-center justify-center mr-4 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 186.69 190.5">
                          <path fill="#4285F4" d="M95.25 77.932v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z" />
                          <path fill="#34A853" d="M41.87 113.57c-3.994-8.183-6.276-17.432-6.276-27.262 0-9.83 2.282-19.078 6.276-27.262V34.056H10.704C3.835 49.419 0 66.898 0 86.308c0 19.41 3.835 36.889 10.704 52.252l31.166-24.991z" />
                          <path fill="#FBBC04" d="M95.25 34.895c13.534 0 25.677 4.671 35.24 13.744l27.39-27.252C142.169 8.27 120.234 0 95.25 0 57.577 0 26.091 21.166 10.704 52.252L41.87 77.243c7.965-23.487 29.866-42.348 53.38-42.348z" />
                          <path fill="#EA4335" d="M95.25 171.877c24.984 0 46.919-8.27 62.629-22.287l-30.913-23.986c-9.002 6.233-20.595 10.1-31.716 10.1-23.514 0-45.415-18.862-53.38-42.348L10.704 120.56C26.091 151.647 57.577 171.877 95.25 171.877z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Google</h3>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center mr-4 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Twitter</h3>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center mr-4 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Facebook</h3>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
