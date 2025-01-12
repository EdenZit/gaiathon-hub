import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - GAIAthon-Hub',
  description: 'Terms of Service for the Edenway Foundation\'s GAIA Clubs Initiative',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-8">Effective Date: 28 January 2022</p>
      
      <div className="prose prose-blue max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using the GAIAthon-Hub platform (&quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Platform.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Services</h2>
        <p>The Platform provides access to Earth Observation tools, resources, and collaboration features. Services include but are not limited to:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>Access to Earth Observation tools and datasets</li>
          <li>Project management and collaboration features</li>
          <li>Training resources and educational content</li>
          <li>Community engagement tools</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. Eligibility</h2>
        <p>You must be at least 13 years old to use our services. If you are under 18, you must have parental or guardian consent to use the Platform.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. Privacy and Data Protection</h2>
        <p>Your use of the Platform is also governed by our Privacy Policy and Cookie Policy. By using the Platform, you consent to the collection and use of your information as described in these policies.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
        <p>All content on the Platform, including text, graphics, logos, and software, is the property of Edenway Foundation or its licensors and is protected by intellectual property laws.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. User Conduct</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>Use the Platform for any unlawful purpose</li>
          <li>Interfere with the Platform&apos;s functionality</li>
          <li>Upload harmful content or malware</li>
          <li>Impersonate others or provide false information</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">7. Availability of Services</h2>
        <p>We strive to maintain the Platform&apos;s availability but do not guarantee uninterrupted access. We reserve the right to modify or discontinue services at any time.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
        <p>The Platform is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the Platform.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">9. Indemnification</h2>
        <p>You agree to indemnify and hold harmless Edenway Foundation and its affiliates from any claims resulting from your use of the Platform.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">10. Termination</h2>
        <p>We reserve the right to terminate or suspend your access to the Platform for violations of these Terms or for any other reason.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
        <p>We may modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified Terms.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">12. Governing Law and Jurisdiction</h2>
        <p>These Terms are governed by the laws of Ghana. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ghana.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">13. Contact Information</h2>
        <p>For questions about these Terms, please contact us at info@edenwayfoundation.com</p>

        <p className="mt-8">By using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
      </div>
    </div>
  );
} 