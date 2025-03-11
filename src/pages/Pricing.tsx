
import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Our Unique Pricing Model</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share and earn - a community-driven approach to creating Halal content
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-sm border border-border mb-12">
            <div className="prose max-w-none">
              <p className="text-lg mb-6">
                We don't follow traditional pricing. Instead, you'll share our website and earn credits. You can use these credits to create content.
              </p>
              
              <h2 className="text-2xl font-medium mb-4">Here's how it works:</h2>
              
              <p className="mb-6">
                Let's say there are two users, user1 and user2. User1 shares our website with a unique link. When user2 signs up using this link, user1 gets one credit because someone signed up using their link.
              </p>
              
              <p className="mb-6">
                If user2 earns credits by sharing or watching ads, user1 gets the same amount of credit automatically. For example, if user2 shares with five people and gets five credits, user1 gets five credits too, even though they didn't do anything. This is because user2 came from user1's referral link.
              </p>
              
              <p className="mb-6">
                One credit can generate content from any of our tools or platforms, like a token for creating a blog, video, or audio. You can have one output from any tool under any category.
              </p>
              
              <p className="mb-8">
                Share our website with your unique link to earn unlimited credits and create unlimited content daily.
              </p>
              
              <p className="text-lg font-medium mb-2">
                We aim to build a community of Halal content creators. Please share our website to help you find and create Halal information.
              </p>
            </div>
          </div>

          <div className="bg-accent rounded-xl p-8 border border-border">
            <h2 className="text-2xl font-medium mb-4 text-center">Ready to get started?</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8">
              <Link to="/signup">
                <Button size="lg" className="w-full md:w-auto">
                  Sign up and get credits
                </Button>
              </Link>
              
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="w-full md:w-auto">
                  View your dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
