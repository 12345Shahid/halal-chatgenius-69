
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // This is a placeholder. In a real app, you would check authentication status
  useEffect(() => {
    // Replace with actual auth check
    const checkAuth = () => {
      const token = localStorage.getItem('session');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  const authLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/profile' },
  ];

  const allLinks = isAuthenticated 
    ? [...navLinks, ...authLinks] 
    : navLinks;

  const handleNavLinkClick = (path: string) => {
    if (!isAuthenticated && ['/dashboard', '/profile'].includes(path)) {
      // Redirect to login for protected routes
      return '/login';
    }
    return path;
  };

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4',
      scrolled ? 'glass-morphism shadow-sm' : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center z-10">
          <span className="text-2xl font-semibold">HalalChat</span>
          <span className="text-primary ml-1 text-2xl">AI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                'font-medium text-sm transition-colors hover:text-primary',
                location.pathname === link.path ? 'text-primary' : 'text-foreground'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons / Profile Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="p-2 hover:bg-secondary rounded-full transition-colors">
                <Bell size={20} className="text-muted-foreground" />
              </Link>
              <div className="relative group">
                <Link to="/profile" className="flex items-center space-x-2 p-1 pl-2 pr-3 hover:bg-secondary rounded-full transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium">Account</span>
                </Link>
                <div className="absolute right-0 mt-2 w-48 glass-morphism rounded-lg shadow-md overflow-hidden origin-top-right scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200">
                  {authLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="block px-4 py-3 text-sm hover:bg-secondary/50 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button 
                    onClick={() => {
                      // Placeholder for logout
                      localStorage.removeItem('session');
                      setIsAuthenticated(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                Log in
              </Link>
              <Link 
                to="/signup" 
                className="text-sm font-medium text-primary-foreground bg-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 focus:outline-none z-10"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        <div className={cn(
          'fixed inset-0 glass-morphism md:hidden transition-all duration-300 ease-in-out flex flex-col pt-20 px-6',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}>
          <div className="flex flex-col space-y-6">
            {allLinks.map((link) => (
              <Link
                key={link.name}
                to={handleNavLinkClick(link.path)}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'text-lg font-medium transition-colors',
                  location.pathname === link.path ? 'text-primary' : 'text-foreground'
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-border pt-6 mt-2">
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    localStorage.removeItem('session');
                    setIsAuthenticated(false);
                    setMobileMenuOpen(false);
                  }}
                  className="text-lg font-medium text-destructive"
                >
                  Sign out
                </button>
              ) : (
                <div className="flex flex-col space-y-4">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center w-full py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
