
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { MessageSquare, Shield, Sparkles, Share2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-semibold mb-6">About HalalChat AI</h1>
              <p className="text-lg text-muted-foreground mb-8">
                The First Free, Unlimited Halal AI Chat Assistant that aligns with Islamic principles.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => navigate('/signup')}
                  className="gap-2"
                >
                  <MessageSquare size={18} />
                  Start Chatting
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/contact')}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-semibold mb-6 text-center">Our Mission</h2>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                HalalChat AI was created with a singular purpose: to provide a powerful AI assistant that respects Islamic principles and values. In today's digital world, AI technology is advancing rapidly, but often without consideration for religious and ethical boundaries.
              </p>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                We believe that Muslims shouldn't have to compromise their values to benefit from cutting-edge AI. That's why we've built an AI assistant that is specifically designed to filter content according to Islamic principles, ensuring that all interactions and generated content align with halal standards.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our mission extends beyond just providing a tool – we aim to build a community of Muslims who can share, learn, and grow together using ethical AI that respects their faith and values.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-semibold mb-12 text-center">What Sets Us Apart</h2>
              
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-16 flex items-start justify-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield size={24} className="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-3">Ethical & Halal AI</h3>
                    <p className="text-muted-foreground">
                      Our AI is specifically designed to filter content according to Islamic principles. We've trained our model to recognize and avoid generating content that contradicts Islamic teachings, ensuring that all interactions and outputs align with halal standards. Whether you're creating blog content, researching information, or just having a conversation, you can trust that HalalChat AI will respect your values.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-16 flex items-start justify-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles size={24} className="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-3">Unlimited Free Access</h3>
                    <p className="text-muted-foreground">
                      We believe that access to ethical AI shouldn't be limited by financial constraints. That's why we offer unlimited free access to our basic features. No credit card or payment is required to start using HalalChat AI. We've implemented an innovative credit system where users can earn credits by sharing our platform with others, creating a community-driven approach to sustainability.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-16 flex items-start justify-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Share2 size={24} className="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-3">Share & Learn</h3>
                    <p className="text-muted-foreground">
                      HalalChat AI is more than just a tool – it's a platform for knowledge sharing. Save, organize, and share AI-generated Islamic content with your community. Our file management system allows you to create folders, categorize your content, and easily find what you need later. You can also mark conversations as favorites and export them in various formats.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-16 flex items-start justify-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users size={24} className="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-3">Community-Driven</h3>
                    <p className="text-muted-foreground">
                      Our unique credit system encourages community growth. When you share our platform and others join through your link, you both benefit. This creates a network effect where the more people use and share HalalChat AI, the more resources everyone has to create valuable content. We're building a global community of Muslims who can benefit from ethical AI together.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-background rounded-xl overflow-hidden shadow-elevated">
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-semibold mb-4">
                    Join Our Growing Community
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Be part of a movement to make AI technology accessible and aligned with Islamic principles.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={() => navigate('/signup')}
                    size="lg"
                    className="px-8"
                  >
                    Get Started Free
                  </Button>
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

export default About;
