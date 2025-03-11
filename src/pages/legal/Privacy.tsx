
import MainNav from "@/components/layout/MainNav";
import Footer from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p>
              At HalalChat AI, we respect your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, and other information you provide when creating an account.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our services, including content generated, features used, and time spent on the platform.</li>
              <li><strong>Device Information:</strong> Information about your device, browser, and how you access our platform.</li>
              <li><strong>Referral Information:</strong> Data about referrals you make and credits earned through our referral system.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information for the following purposes:
            </p>
            <ul>
              <li>To provide, maintain, and improve our services</li>
              <li>To process transactions and manage your account</li>
              <li>To send you updates, security alerts, and administrative messages</li>
              <li>To track and analyze usage patterns to enhance user experience</li>
              <li>To verify your identity and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We may share your information in the following circumstances:
            </p>
            <ul>
              <li><strong>With Service Providers:</strong> Third-party vendors who help us provide our services.</li>
              <li><strong>For Legal Reasons:</strong> When required by law or to protect our rights.</li>
              <li><strong>With Your Consent:</strong> When you have explicitly agreed to the sharing of your information.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
            <p>
              We will never sell your personal information to third parties.
            </p>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. 
              However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>The right to access and receive a copy of your personal information</li>
              <li>The right to correct or update your personal information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to restrict or object to our processing of your personal information</li>
              <li>The right to data portability</li>
            </ul>
            <p>
              To exercise these rights, please contact us at privacy@halalchatai.com.
            </p>

            <h2>6. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. 
              If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information.
            </p>

            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. 
              Cookies are files with a small amount of data that may include an anonymous unique identifier. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
              For more information, please refer to our Cookie Policy.
            </p>

            <h2>8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this Privacy Policy periodically for any changes.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@halalchatai.com.
            </p>

            <p className="text-sm text-muted-foreground mt-8">Last updated: June 15, 2023</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
