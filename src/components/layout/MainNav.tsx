import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ChevronDown,
  LogOut,
  LucideIcon,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  to: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  isMobile?: boolean;
  badge?: string;
}

const NavItem = ({
  to,
  label,
  icon: Icon,
  onClick,
  active,
  isMobile,
  badge,
}: NavItemProps) => {
  const baseClasses = "flex items-center text-sm font-medium transition-colors";
  const desktopClasses = `${baseClasses} px-4 py-2 rounded-md ${
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  }`;
  const mobileClasses = `${baseClasses} p-3 w-full justify-start ${
    active ? "text-primary" : "text-muted-foreground"
  }`;

  const content = (
    <>
      {Icon && <Icon size={isMobile ? 18 : 16} className="mr-2" />}
      <span>{label}</span>
      {badge && (
        <Badge variant="outline" className="ml-2">
          {badge}
        </Badge>
      )}
    </>
  );

  if (to.startsWith("http")) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={isMobile ? mobileClasses : desktopClasses}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={to}
      className={isMobile ? mobileClasses : desktopClasses}
      onClick={onClick}
    >
      {content}
    </Link>
  );
};

export default function MainNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const userInitials = user
    ? user.email?.substring(0, 2).toUpperCase() || "U"
    : "G";

  const navItems = [
    {
      to: "/",
      label: "Home",
      isActive: isActive("/"),
    },
    {
      to: "/about",
      label: "About",
      isActive: isActive("/about"),
    },
    {
      to: "/pricing",
      label: "Pricing",
      isActive: isActive("/pricing"),
    },
    {
      to: "/contact",
      label: "Contact",
      isActive: isActive("/contact"),
    },
  ];

  const authenticatedItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      isActive: isActive("/dashboard"),
    },
    {
      to: "/tools",
      label: "Tools",
      isActive:
        isActive("/tools") || location.pathname.startsWith("/tools/"),
    },
    {
      to: "/files",
      label: "Files",
      isActive: isActive("/files"),
    },
  ];

  const closeSheet = () => {
    setSheetOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all ${
        isScrolled
          ? "border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-semibold">HalalChat</span>
            <span className="text-primary ml-1 text-xl">AI</span>
          </Link>

          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-1 ml-6">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  active={item.isActive}
                />
              ))}

              {user &&
                authenticatedItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    active={item.isActive}
                  />
                ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
          >
            {theme === "light" ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </Button>

          {user ? (
            <>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                  onClick={() => navigate("/notifications")}
                >
                  <Bell size={18} />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
                </Button>
              )}

              {!isMobile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 rounded-full pr-3 pl-2.5"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User size={16} className="mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/notifications")}>
                      <Bell size={16} className="mr-2" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <Settings size={16} className="mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut size={16} className="mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {isMobile && (
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Menu size={18} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 flex flex-col">
                    <div className="p-6 border-b">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Member
                          </p>
                        </div>
                      </div>
                    </div>
                    <nav className="flex-1 overflow-auto py-4">
                      <div className="px-3 py-2">
                        <p className="text-xs font-medium text-muted-foreground px-3 mb-2">
                          MENU
                        </p>
                        {navItems.map((item) => (
                          <SheetClose asChild key={item.to}>
                            <NavItem
                              to={item.to}
                              label={item.label}
                              active={item.isActive}
                              isMobile
                            />
                          </SheetClose>
                        ))}
                        {authenticatedItems.map((item) => (
                          <SheetClose asChild key={item.to}>
                            <NavItem
                              to={item.to}
                              label={item.label}
                              active={item.isActive}
                              isMobile
                            />
                          </SheetClose>
                        ))}
                      </div>
                      <div className="border-t my-2"></div>
                      <div className="px-3 py-2">
                        <p className="text-xs font-medium text-muted-foreground px-3 mb-2">
                          ACCOUNT
                        </p>
                        <SheetClose asChild>
                          <NavItem
                            to="/profile"
                            label="Profile"
                            icon={User}
                            isMobile
                          />
                        </SheetClose>
                        <SheetClose asChild>
                          <NavItem
                            to="/notifications"
                            label="Notifications"
                            icon={Bell}
                            isMobile
                            badge="New"
                          />
                        </SheetClose>
                        <SheetClose asChild>
                          <NavItem
                            to="/dashboard"
                            label="Dashboard"
                            icon={Settings}
                            isMobile
                          />
                        </SheetClose>
                      </div>
                    </nav>
                    <div className="border-t p-6">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleSignOut}
                      >
                        <LogOut size={16} className="mr-2" />
                        Log out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </>
          ) : (
            <>
              {!isMobile ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </Button>
                  <Button onClick={() => navigate("/signup")}>Sign up</Button>
                </>
              ) : (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Menu size={18} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 flex flex-col">
                    <div className="p-6">
                      <Link to="/" className="flex items-center mb-6">
                        <span className="text-xl font-semibold">HalalChat</span>
                        <span className="text-primary ml-1 text-xl">AI</span>
                      </Link>
                    </div>
                    <nav className="flex-1 overflow-auto py-4">
                      <div className="px-3 py-2">
                        {navItems.map((item) => (
                          <SheetClose asChild key={item.to}>
                            <NavItem
                              to={item.to}
                              label={item.label}
                              active={item.isActive}
                              isMobile
                            />
                          </SheetClose>
                        ))}
                      </div>
                    </nav>
                    <div className="border-t p-6 space-y-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/login")}
                      >
                        Log in
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => navigate("/signup")}
                      >
                        Sign up
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
