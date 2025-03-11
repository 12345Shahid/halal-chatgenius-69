
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

type MainNavProps = {
  containerClassName?: string;
};

const MainNav = ({ containerClassName }: MainNavProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const mainNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Pricing', path: '/pricing' },
  ];

  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Arabic', code: 'ar' },
    { name: 'French', code: 'fr' },
    { name: 'Spanish', code: 'es' },
    { name: 'Chinese', code: 'zh' },
  ];

  const userNavLinks = user ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/profile' },
    { name: 'Notifications', path: '/notifications' },
  ] : [];

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect is handled by the AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className={cn("w-full py-4 z-10", containerClassName)}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-semibold">HalalChat</span>
            <span className="text-primary ml-1 text-2xl">AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {/* Main Links */}
            <div className="flex space-x-6">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center text-sm font-medium text-foreground hover:text-primary"
              >
                <Globe className="w-4 h-4 mr-1" />
                <span>Language</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-20 py-1 border border-border">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent/50"
                      onClick={() => {
                        // Set language logic would go here
                        setLanguageMenuOpen(false);
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                {userNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {link.name}
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-sm font-medium"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" className="text-sm font-medium">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="text-sm font-medium">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="pt-4 pb-3 space-y-1 px-2">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent/50"
                  )}
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <>
                  {userNavLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent/50"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent/50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent/50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary bg-accent/50 hover:bg-accent"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Language Selector */}
              <div className="pt-4 pb-3 border-t border-border">
                <div className="space-y-1">
                  <p className="px-3 text-sm font-medium text-muted-foreground">Language</p>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className="w-full text-left block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent/50"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNav;
