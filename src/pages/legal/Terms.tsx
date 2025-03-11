
import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p>
              Welcome to HalalChat AI. These Terms of Service govern your use of our website and services.
              By accessing or using our services, you agree to be bound by these terms.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using HalalChat AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              HalalChat AI provides AI-powered content generation tools that follow Islamic principles. Our platform allows users to create 
              various types of content including but not limited to blog posts, YouTube scripts, research summaries, code, and more.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To access certain features of our service, you must register for an account. You are responsible for maintaining the confidentiality of your account 
              information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2>4. Credits System</h2>
            <p>
              Our platform operates on a credit-based system. Credits are earned through referrals and watching advertisements. You can use these credits to 
              generate content. The specific credit requirements for various services may change over time, and we reserve the right to modify the credit system.
            </p>

            <h2>5. User Conduct</h2>
            <p>
              You agree not to use our services for any unlawful purpose or in a way that violates Islamic principles. This includes but is not limited to:
            </p>
            <ul>
              <li>Generating content that promotes hate speech, violence, or discrimination</li>
              <li>Creating content that contains sexually explicit material</li>
              <li>Using our platform to promote alcohol, gambling, or other prohibited activities</li>
              <li>Attempting to manipulate or abuse the credit system</li>
              <li>Reverse engineering or attempting to extract the source code of our software</li>
            </ul>

            <h2>6. Content Ownership</h2>
            <p>
              You retain ownership of any content you generate using our services. However, you grant us a non-exclusive, worldwide, royalty-free license to 
              use, reproduce, modify, adapt, publish, and display such content for the purpose of providing and improving our services.
            </p>

            <h2>7. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time, without notice, for conduct that we believe violates these Terms or 
              is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on our website. Your continued use 
              of the service after such modifications will constitute your acknowledgment of the modified Terms.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              Our services are provided "as is" without any warranties, expressed or implied. We do not guarantee that our services will always be safe, 
              secure, or error-free, or that they will function without disruptions, delays, or imperfections.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, HalalChat AI shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with Islamic law and the laws of the jurisdiction in which our company is registered, 
              without regard to its conflict of law provisions.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@halalchatai.com.
            </p>

            <p className="text-sm text-muted-foreground mt-8">Last updated: June 15, 2023</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
