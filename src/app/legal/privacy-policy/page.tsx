import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - GAIAthon-Hub',
  description: 'Privacy Policy for the Edenway Foundation\'s GAIA Clubs Initiative',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Effective Date: 28 January 2022</p>
      
      <div className="prose prose-blue max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>Welcome to Edenway Foundation&apos;s GAIA Clubs Initiative (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you use our website and services.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        <p>We may collect the following types of personal information:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li><strong>Contact Information:</strong> Your name, email address, phone number, and any other information you provide when signing up or contacting us.</li>
          <li><strong>Demographic Information:</strong> Age, gender, and other relevant demographic details.</li>
          <li><strong>Usage Information:</strong> Information about your use of our website, including IP addresses, browser type, device information, and access times.</li>
          <li><strong>Course Data:</strong> Information related to your participation in our training courses, assignments, and progress.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <p>We may use your personal information for the following purposes:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>To provide and improve our services, including course delivery and support.</li>
          <li>To communicate with you, respond to your inquiries, and send you updates or important information.</li>
          <li>To analyze user behavior and preferences to enhance our website and services.</li>
          <li>To comply with legal obligations and regulations.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Sharing and Disclosure</h2>
        <p>We may share your personal information under the following circumstances:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>With volunteers, instructors, and partners involved in the GAIA Clubs Initiative to facilitate course delivery.</li>
          <li>With service providers who assist us in managing and operating our website and services.</li>
          <li>To comply with legal requirements, such as responding to subpoenas or court orders.</li>
          <li>To comply with legal obligations and regulations.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
        <p>We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of data transmission or storage is completely secure.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Your Choices</h2>
        <p>You can access, update, or delete your personal information by contacting us. You may also have the option to unsubscribe from our communications.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">7. Children&apos;s Privacy</h2>
        <p>Our services are not intended for individuals under the age of 13. If you are a parent or guardian and believe we have collected personal information about a child, please contact us, and we will take steps to remove the information.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to this Privacy Policy</h2>
        <p>We may update this Privacy Policy periodically to reflect changes in our practices. We will notify you of any material changes via email or by posting a notice on our website.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
        <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at info@edenwayfoundation.com</p>

        <p className="mt-8">By using our website and services, you consent to the practices described in this Privacy Policy.</p>
      </div>
    </div>
  );
} 