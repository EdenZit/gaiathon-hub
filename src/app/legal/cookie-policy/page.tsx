import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - GAIAthon-Hub',
  description: 'Cookie Policy for the Edenway Foundation\'s GAIA Clubs Initiative',
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Effective Date: 28 January 2022</p>
      
      <div className="prose prose-blue max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>This Cookie Policy explains how Edenway Foundation&apos;s GAIA Clubs Initiative (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar technologies on our website. By using our website, you consent to the use of cookies as described in this policy.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. What Are Cookies?</h2>
        <p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. Types of Cookies We Use</h2>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li><strong>Essential Cookies:</strong> Required for the website to function properly, including navigation and access to secure areas.</li>
          <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
          <li><strong>Functionality Cookies:</strong> Enable enhanced functionality and personalization, such as remembering your preferences.</li>
          <li><strong>Analytics Cookies:</strong> Provide information about how the website is used, helping us improve its performance and user experience.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. Third-Party Cookies</h2>
        <p>Some cookies may be set by third-party services that appear on our website. We do not control these cookies and recommend reviewing the privacy policies of these third parties for more information.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Managing Cookies</h2>
        <p>You can control and manage cookies in various ways:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>Modify your browser settings to accept or reject cookies.</li>
          <li>Delete cookies that have already been set.</li>
          <li>Choose to be notified when a cookie is being set.</li>
        </ul>
        <p className="mt-4">Please note that disabling cookies may affect the functionality of our website and your user experience.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Updates to This Policy</h2>
        <p>We may update this Cookie Policy periodically to reflect changes in our practices or for operational, legal, or regulatory reasons. The updated version will be posted on our website with a revised effective date.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">7. Contact Us</h2>
        <p>If you have any questions about our use of cookies, please contact us at info@edenwayfoundation.com</p>

        <p className="mt-8">By continuing to use our website, you agree to the placement of cookies on your device unless you have disabled them.</p>
      </div>
    </div>
  );
} 