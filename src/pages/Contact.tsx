
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-semibold mb-4">Get in Touch</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  We'd love to hear from you. Reach out with questions, feedback, or partnership opportunities.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-background rounded-xl p-6 shadow-subtle border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Email Us</h3>
                  <p className="text-muted-foreground text-sm mb-4">Our friendly team is here to help</p>
                  <a href="mailto:hello@halalchat.ai" className="text-primary hover:underline">hello@halalchat.ai</a>
                </div>
                
                <div className="bg-background rounded-xl p-6 shadow-subtle border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Office</h3>
                  <p className="text-muted-foreground text-sm mb-4">Come say hello at our office</p>
                  <p className="text-sm">123 Innovation Drive<br />Tech City, TC 10001</p>
                </div>
                
                <div className="bg-background rounded-xl p-6 shadow-subtle border border-border text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone size={20} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Phone</h3>
                  <p className="text-muted-foreground text-sm mb-4">Mon-Fri from 8am to 5pm</p>
                  <a href="tel:+1234567890" className="text-primary hover:underline">+1 (234) 567-890</a>
                </div>
              </div>
              
              <div className="bg-background rounded-xl overflow-hidden shadow-elevated border border-border">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-12">
                    <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
                    
                    {submitted ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                        <p className="font-medium">Thank you for your message!</p>
                        <p className="text-sm mt-1">We'll get back to you as soon as possible.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                            <input
                              id="name"
                              name="name"
                              type="text"
                              required
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                          <select
                            id="subject"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">Select a subject</option>
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Technical Support">Technical Support</option>
                            <option value="Feature Request">Feature Request</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="mb-6">
                          <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                          <textarea
                            id="message"
                            name="message"
                            required
                            value={formData.message}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="How can we help you?"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          isLoading={isSubmitting}
                          className="w-full sm:w-auto"
                        >
                          {!isSubmitting && <Send size={16} className="mr-2" />}
                          Send Message
                        </Button>
                      </form>
                    )}
                  </div>
                  
                  <div className="bg-secondary hidden md:block">
                    <div className="h-full w-full p-12 flex items-center justify-center">
                      <div className="space-y-8">
                        <div className="glass-morphism p-8 rounded-xl max-w-xs mx-auto">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <div className="text-primary font-semibold text-xl">FAQ</div>
                            </div>
                            <h3 className="text-lg font-medium mb-2">Have Questions?</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                              Check our frequently asked questions for quick answers to common inquiries.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full"
                            >
                              Visit FAQ Page
                            </Button>
                          </div>
                        </div>
                        
                        <div className="neo-morphism p-6 rounded-xl max-w-xs mx-auto">
                          <p className="text-muted-foreground text-sm italic">
                            "Our support team typically responds within 24 hours during business days. We're committed to addressing your inquiries as quickly as possible."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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

export default Contact;
