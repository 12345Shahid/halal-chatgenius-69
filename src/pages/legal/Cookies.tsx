
import { useState } from "react";
import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

const Cookies = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
  });

  const handleTogglePreference = (key: keyof typeof cookiePreferences) => {
    if (key === 'necessary') return; // Necessary cookies can't be disabled
    setCookiePreferences({
      ...cookiePreferences,
      [key]: !cookiePreferences[key]
    });
  };

  const handleSavePreferences = () => {
    // This would normally save cookie preferences to localStorage or cookies
    toast.success("Cookie preferences saved");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6">Cookie Policy</h1>
          
          <div className="prose max-w-none mb-8">
            <p>
              This Cookie Policy explains how HalalChat AI uses cookies and similar technologies to recognize you when you visit our website. 
              It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
              Cookies are widely used by website owners to make their websites work, or work more efficiently, as well as to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, HalalChat AI) are called "first-party cookies." 
              Cookies set by parties other than the website owner are called "third-party cookies." 
              Third-party cookies enable third-party features or functionality to be provided on or through the website 
              (e.g., advertising, interactive content, and analytics).
            </p>

            <h2>Why Do We Use Cookies?</h2>
            <p>
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons for our website to operate, 
              and we refer to these as "essential" or "necessary" cookies. Other cookies enable us to track and target the interests of our users 
              to enhance the user experience on our website. Third parties serve cookies through our website for analytics and other purposes.
            </p>

            <h2>Types of Cookies We Use</h2>
            <p>
              The specific types of cookies served through our website and the purposes they perform are described below:
            </p>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are strictly necessary to provide you with services available through our website and to use some of its features, 
              such as access to secure areas. Because these cookies are strictly necessary to deliver the website, you cannot refuse them.
            </p>

            <h3>Functional Cookies</h3>
            <p>
              These cookies allow us to remember choices you make when you use our website, such as remembering your login details or language preference. 
              The purpose of these cookies is to provide you with a more personal experience and to avoid you having to re-enter your preferences every time you visit our website.
            </p>

            <h3>Analytics Cookies</h3>
            <p>
              These cookies collect information that is used either in aggregate form to help us understand how our website is being used or 
              how effective our marketing campaigns are, or to help us customize our website for you.
            </p>

            <h3>Marketing Cookies</h3>
            <p>
              These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from 
              continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests.
            </p>

            <h2>How Can You Control Cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. 
              You can set or amend your web browser controls to accept or refuse cookies. 
              If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Cookie Preferences</h2>
            <p className="text-muted-foreground mb-6">
              You can customize your cookie preferences below. Please note that disabling some types of cookies may impact your experience on our website.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Necessary Cookies</h3>
                  <p className="text-sm text-muted-foreground">These cookies are essential for the website to function properly.</p>
                </div>
                <div className="relative inline-block w-12 h-6 mr-2">
                  <input 
                    type="checkbox" 
                    className="opacity-0 w-0 h-0" 
                    checked={cookiePreferences.necessary} 
                    disabled 
                  />
                  <span className={`absolute cursor-not-allowed top-0 left-0 right-0 bottom-0 rounded-full bg-primary transition-colors duration-200`}>
                    <span className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-transform duration-200 transform translate-x-6`}></span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Functional Cookies</h3>
                  <p className="text-sm text-muted-foreground">These cookies enable personalized features and functionality.</p>
                </div>
                <div className="relative inline-block w-12 h-6 mr-2">
                  <input 
                    type="checkbox" 
                    className="opacity-0 w-0 h-0" 
                    checked={cookiePreferences.functional} 
                    onChange={() => handleTogglePreference('functional')} 
                  />
                  <span 
                    onClick={() => handleTogglePreference('functional')}
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full ${cookiePreferences.functional ? 'bg-primary' : 'bg-gray-300'} transition-colors duration-200`}
                  >
                    <span className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-transform duration-200 transform ${cookiePreferences.functional ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <h3 className="font-medium">Analytics Cookies</h3>
                  <p className="text-sm text-muted-foreground">These cookies help us improve our website by collecting anonymous usage information.</p>
                </div>
                <div className="relative inline-block w-12 h-6 mr-2">
                  <input 
                    type="checkbox" 
                    className="opacity-0 w-0 h-0" 
                    checked={cookiePreferences.analytics} 
                    onChange={() => handleTogglePreference('analytics')} 
                  />
                  <span 
                    onClick={() => handleTogglePreference('analytics')}
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full ${cookiePreferences.analytics ? 'bg-primary' : 'bg-gray-300'} transition-colors duration-200`}
                  >
                    <span className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-transform duration-200 transform ${cookiePreferences.analytics ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium">Marketing Cookies</h3>
                  <p className="text-sm text-muted-foreground">These cookies are used to display relevant advertisements to you.</p>
                </div>
                <div className="relative inline-block w-12 h-6 mr-2">
                  <input 
                    type="checkbox" 
                    className="opacity-0 w-0 h-0" 
                    checked={cookiePreferences.marketing} 
                    onChange={() => handleTogglePreference('marketing')} 
                  />
                  <span 
                    onClick={() => handleTogglePreference('marketing')}
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full ${cookiePreferences.marketing ? 'bg-primary' : 'bg-gray-300'} transition-colors duration-200`}
                  >
                    <span className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-transform duration-200 transform ${cookiePreferences.marketing ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-right">
              <Button onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2>How to Delete Cookies</h2>
            <p>
              Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, 
              delete cookies, or to alert you when cookies are being sent. The methods for doing so vary from browser to browser 
              and from version to version. However, you can usually find this information in the "Help," "Tools," or "Edit" menu of your browser.
            </p>

            <p className="text-sm text-muted-foreground mt-8">Last updated: June 15, 2023</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;
