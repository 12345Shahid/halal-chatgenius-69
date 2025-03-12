import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNav from "@/components/layout/MainNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Coins, Share2, PlayCircle, History, Copy, Folder } from "lucide-react";
import { toast } from "sonner";
import { useCredits } from "@/hooks/use-credits";
import { useReferral } from "@/hooks/use-referral";

interface Activity {
  id: string;
  title: string;
  type: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { credits, loading: creditsLoading } = useCredits();
  const { referralLink } = useReferral();
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent activity
        const { data: activityData, error: activityError } = await supabase
          .from("content")
          .select("id, title, type, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (activityError) {
          console.error("Error fetching activity:", activityError);
        } else {
          setRecentActivity(activityData || []);
        }

        // Set referral link
        setReferralLink(`${window.location.origin}/signup?ref=${user.id}`);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, navigate]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "blog":
        return "📝";
      case "youtube":
        return "🎬";
      case "research":
        return "🔍";
      case "developer":
        return "💻";
      default:
        return "📄";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <Button onClick={() => navigate("/tools")}>
            Create New Content
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Credits Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Coins className="mr-2 h-5 w-5 text-primary" />
                Total Credits
              </CardTitle>
              <CardDescription>Available for content generation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{creditsLoading ? "..." : credits?.total_credits || 0}</p>
            </CardContent>
          </Card>

          {/* Referral Credits Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Share2 className="mr-2 h-5 w-5 text-primary" />
                Referral Credits
              </CardTitle>
              <CardDescription>Earned from referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{creditsLoading ? "..." : credits?.referral_credits || 0}</p>
            </CardContent>
          </Card>

          {/* Ad Credits Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <PlayCircle className="mr-2 h-5 w-5 text-primary" />
                Ad Credits
              </CardTitle>
              <CardDescription>Earned from watching ads</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{creditsLoading ? "..." : credits?.ad_credits || 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Content generated in the last two months</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start p-3 hover:bg-accent/50 rounded-md transition-colors">
                        <div className="mr-3 text-2xl">{getActivityTypeIcon(activity.type)}</div>
                        <div className="flex-1">
                          <h3 className="font-medium">{activity.title}</h3>
                          <div className="flex items-center mt-1">
                            <Badge variant="secondary" className="mr-2">
                              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/editor/${activity.id}`)}
                        >
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share & Earn</CardTitle>
                <CardDescription>Refer friends to earn credits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share your unique referral link and earn credits when people sign up
                </p>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <Button 
                    size="icon"
                    onClick={copyReferralLink}
                    className="h-10 w-10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Folder className="mr-2 h-5 w-5 text-primary" />
                  File Management
                </CardTitle>
                <CardDescription>Organize your content</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/files")}
                >
                  Manage Files & Folders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
