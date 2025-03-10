
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-16 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div 
            className="inline-block px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary text-xs font-medium"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <span className="animate-pulse-subtle">🚀 The First Free, Unlimited Halal AI Chat Assistant</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight md:leading-tight text-balance max-w-3xl mb-6 animate-fade-in">
            Chat with the world's best <span className="text-primary">Halal AI</span> model
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mb-8 animate-fade-in animation-delay-200">
            An ethical AI assistant that respects Islamic principles, offers unlimited free access, 
            and helps you create, save, and share content aligned with your values.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in animation-delay-400">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="gap-2 text-base"
            >
              Start Chatting Free
              <ArrowRight size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/about')}
              className="text-base" 
            >
              Learn More
            </Button>
          </div>
          
          <div className="relative w-full max-w-4xl mx-auto animate-fade-in animation-delay-600">
            <div className="aspect-video rounded-xl overflow-hidden glass-morphism shadow-elevated border border-white/20">
              <div className="absolute inset-0">
                {/* Chat interface mockup */}
                <div className="flex flex-col h-full p-4">
                  <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive/50"></div>
                      <div className="w-3 h-3 rounded-full bg-accent-foreground/30"></div>
                      <div className="w-3 h-3 rounded-full bg-primary/50"></div>
                    </div>
                    <div className="text-xs text-muted-foreground">HalalChat AI</div>
                    <div className="w-16"></div>
                  </div>
                  
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex flex-col gap-4 overflow-y-auto p-2">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">AI</div>
                        <div className="bg-secondary rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                          <p>Assalamu alaikum! I'm HalalChat AI. How can I assist you today in creating content that aligns with Islamic principles?</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-primary/10 text-foreground rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                          <p>Can you write a short paragraph about the importance of seeking knowledge in Islam?</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-accent-foreground/10 flex items-center justify-center text-accent-foreground font-medium">U</div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">AI</div>
                        <div className="bg-secondary rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                          <p>Seeking knowledge is a profound duty in Islam. Prophet Muhammad (peace be upon him) emphasized its importance saying, "Seeking knowledge is an obligation upon every Muslim." This divine directive reflects Islam's reverence for education and intellectual growth. Knowledge illuminates our path, deepens our understanding of faith, and enables us to contribute positively to society. By seeking both religious and worldly knowledge with pure intentions, Muslims fulfill a spiritual obligation while developing themselves. In the Quran, Allah elevates those with knowledge, highlighting the eternal value of learning as an act of worship that brings us closer to understanding our purpose and our Creator.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-border">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Type your message here..."
                          className="w-full rounded-lg border border-border bg-secondary/50 py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button className="absolute right-3 top-3 text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m22 2-7 20-4-9-9-4 20-7Z" />
                            <path d="M22 2 11 13" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
