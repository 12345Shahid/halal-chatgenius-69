
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle the newsletter subscription
    console.log('Newsletter subscription:', email);
    navigate('/signup?email=' + encodeURIComponent(email));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <Features />

        {/* Tools Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                Specialized AI Tools
              </h2>
              <p className="text-muted-foreground">
                Unleash your creativity with our suite of purpose-built AI tools designed to help you create halal content.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  title: 'Blog Writing',
                  description: 'Create blog posts that align with Islamic values',
                  color: 'bg-[#f5f0ff]',
                  textColor: 'text-[#7c3aed]'
                },
                {
                  title: 'YouTube Content',
                  description: 'Generate scripts and descriptions for videos',
                  color: 'bg-[#ffefef]',
                  textColor: 'text-[#ef4444]'
                },
                {
                  title: 'Research',
                  description: 'Gather information from halal sources',
                  color: 'bg-[#e9f5fe]',
                  textColor: 'text-[#0284c7]'
                },
                {
                  title: 'Programming',
                  description: 'Get help with code and development',
                  color: 'bg-[#ecfdf5]',
                  textColor: 'text-[#10b981]'
                },
                {
                  title: 'General Chat',
                  description: 'Ask questions and get halal answers',
                  color: 'bg-[#fef5e7]',
                  textColor: 'text-[#f59e0b]'
                }
              ].map((tool, index) => (
                <div 
                  key={index}
                  className="rounded-xl p-6 border border-border shadow-subtle hover:shadow-elevated transition-all duration-300 flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-lg ${tool.color} ${tool.textColor} flex items-center justify-center mb-4`}>
                    <span className="font-semibold text-lg">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{tool.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{tool.description}</p>
                  <Button 
                    variant="ghost" 
                    className={`mt-auto justify-start p-0 hover:bg-transparent ${tool.textColor}`}
                    onClick={() => navigate('/login')}
                  >
                    Try it now
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-background rounded-xl overflow-hidden shadow-elevated">
              <div className="relative p-8 md:p-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                      Ready to Experience Halal AI?
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Join thousands of users creating content that respects Islamic principles. Start for free today!
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" className="sm:whitespace-nowrap">
                      Get Started Free
                    </Button>
                  </form>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    No credit card required. Start with 20 free credits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
