
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Hero() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a question or prompt');
      return;
    }
    
    if (user) {
      // If logged in, redirect to tools/general
      navigate(`/tools/general?prompt=${encodeURIComponent(prompt)}`);
    } else {
      // If not logged in, redirect to login with information about the intended destination
      console.log("User not logged in, redirecting to login");
      toast.info('Please login to chat with HalalChat AI');
      navigate('/login', { 
        state: { 
          redirectTo: '/tools/general', 
          prompt 
        } 
      });
    }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32 bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/0 pointer-events-none" aria-hidden="true"></div>

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center pb-12 md:pb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
            The First Free, Unlimited Halal AI Chat Assistant
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10">
            🚀 Halal AI Chat is a free, unlimited AI assistant that lets you chat with the world's best AI model
          </p>

          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything..."
                className="w-full h-14 px-6 py-4 rounded-full border border-border bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary pr-16"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </form>

          <div className="flex flex-col md:flex-row justify-center gap-6 mb-12">
            <Button
              size="lg"
              className="h-14 px-8 rounded-full"
              onClick={() => {
                if (user) {
                  navigate('/tools');
                } else {
                  console.log("User not logged in, redirecting to login");
                  navigate('/login');
                  toast.info('Please login to access tools');
                }
              }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Creating
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 rounded-full"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-card border border-border p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">🔹 Ethical & Halal AI</h3>
              <p className="text-muted-foreground">AI-generated content is filtered to align with Islamic principles.</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">🔹 Unlimited Free Access</h3>
              <p className="text-muted-foreground">No credit card or payment required. Just chat and generate.</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">🔹 Share & Learn</h3>
              <p className="text-muted-foreground">Save, organize, and share AI-generated Islamic content.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
