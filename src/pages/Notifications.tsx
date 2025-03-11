
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNav from "@/components/layout/MainNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Gift, Users, FileText, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "system" | "referral" | "credit" | "content";
  isRead: boolean;
  createdAt: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // This would normally fetch actual notifications from Supabase
        // For now, using mock data
        const mockNotifications: Notification[] = [
          {
            id: "1",
            title: "Welcome to HalalChat AI!",
            message: "Thank you for joining our platform. Start creating Halal content today!",
            type: "system",
            isRead: false,
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
          {
            id: "2",
            title: "New referral",
            message: "Someone signed up using your referral link. You earned 1 credit!",
            type: "referral",
            isRead: true,
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
          {
            id: "3",
            title: "Credits added",
            message: "You received 5 new credits from referral bonuses.",
            type: "credit",
            isRead: false,
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
          {
            id: "4",
            title: "Content generated",
            message: "Your blog post 'The Importance of Halal Food' has been generated successfully.",
            type: "content",
            isRead: true,
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          },
        ];

        setNotifications(mockNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, navigate]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    toast.success("Notification deleted");
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
    toast.success("All notifications deleted");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "system":
        return <Bell className="h-5 w-5 text-blue-500" />;
      case "referral":
        return <Users className="h-5 w-5 text-green-500" />;
      case "credit":
        return <Gift className="h-5 w-5 text-purple-500" />;
      case "content":
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "system":
        return "bg-blue-100 text-blue-800";
      case "referral":
        return "bg-green-100 text-green-800";
      case "credit":
        return "bg-purple-100 text-purple-800";
      case "content":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-muted-foreground mt-1">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
              )}
              
              {notifications.length > 0 && (
                <Button variant="outline" onClick={deleteAllNotifications} className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  You don't have any notifications at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={notification.isRead ? "opacity-75" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="mr-4 p-2 rounded-full bg-muted">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={getNotificationColor(notification.type)}>
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </Badge>
                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-primary"></span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          
                          <div className="flex space-x-2">
                            {!notification.isRead && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 px-2 text-xs"
                              >
                                Mark as read
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
