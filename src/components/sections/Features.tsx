
import { Check, Sparkles, Shield, Share2 } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Shield size={24} className="text-primary" />,
      title: 'Ethical & Halal AI',
      description: 'AI-generated content is carefully filtered to align with Islamic principles, ensuring ethical and respectful outputs.',
    },
    {
      icon: <Sparkles size={24} className="text-primary" />,
      title: 'Unlimited Free Access',
      description: 'No credit card or payment required. Just chat and generate content as much as you need.',
    },
    {
      icon: <Share2 size={24} className="text-primary" />,
      title: 'Share & Learn',
      description: 'Save, organize, and share AI-generated Islamic content with your community.',
    },
  ];

  const upcomingFeatures = [
    'Faster AI responses',
    'Audio generation',
    'Video creation tools',
    'Image generation',
    'Specialized tools for specific niches',
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Powerful Features
          </h2>
          <p className="text-muted-foreground">
            Experience the best of AI technology while staying true to Islamic values.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-background rounded-xl p-6 shadow-subtle border border-border flex flex-col transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-background rounded-xl p-8 shadow-subtle border border-border">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <h3 className="text-2xl font-medium mb-4">Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                We're constantly working to enhance your experience with new features and tools.
              </p>
              <ul className="space-y-3">
                {upcomingFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 rounded-lg overflow-hidden glass-morphism">
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div 
                      key={item} 
                      className="aspect-square rounded-lg bg-white/20 backdrop-blur-xs animate-pulse-subtle"
                      style={{ animationDelay: `${item * 0.1}s` }}
                    />
                  ))}
                </div>
                <div className="mt-4 h-10 w-3/4 mx-auto rounded-lg bg-white/20 animate-pulse-subtle" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
