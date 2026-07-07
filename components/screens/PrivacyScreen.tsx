import React from "react";

interface PrivacyScreenProps {
  onBack: () => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0F1115] text-white overflow-y-auto">
      <div className="sticky top-0 bg-[#161B22] border-b border-gray-800 p-4 flex items-center">
        <button
          onClick={onBack}
          className="text-blue-400 font-semibold mr-4"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold">
          Privacy Policy
        </h1>
      </div>

      <div className="p-5 space-y-6 text-gray-300 leading-7">

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            1. Introduction
          </h2>

          <p>
            FlashNews24 respects your privacy and is committed to protecting
            your personal information. This Privacy Policy explains how our
            application collects, uses, stores and protects information while
            providing breaking news, world news, technology updates and other
            content.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            2. Information We Collect
          </h2>

          <p>
            FlashNews24 does not require users to create an account. Depending
            on the features you use, the application may store bookmarked
            articles, notification preferences and cached news for offline
            reading.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            3. How We Use Information
          </h2>

          <ul className="list-disc ml-6 space-y-2">
            <li>Display breaking news and live updates.</li>
            <li>Save bookmarks locally.</li>
            <li>Improve application performance.</li>
            <li>Deliver push notifications.</li>
            <li>Maintain security and reliability.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            4. Permissions
          </h2>

          <ul className="list-disc ml-6 space-y-2">
            <li>Internet Access</li>
            <li>Network State</li>
            <li>Push Notifications</li>
            <li>Foreground Service (if applicable)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            5. Third-Party Services
          </h2>

          <p>
            FlashNews24 may use Google Play Services, Firebase Cloud Messaging,
            Blogger API and other trusted services to deliver notifications and
            news content.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            6. Data Security
          </h2>

          <p>
            We take reasonable security measures to protect locally stored data.
            However, no electronic storage or internet transmission method is
            completely secure.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            7. Children's Privacy
          </h2>

          <p>
            FlashNews24 is not intended for children under the age of 13. We do
            not knowingly collect personal information from children.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            8. Policy Updates
          </h2>

          <p>
            This Privacy Policy may be updated from time to time. Changes become
            effective immediately after publication inside the application.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            9. Contact Us
          </h2>

          <p>
            Website: https://flashnews24.site
          </p>

          <p>
            Email: support@flashnews24.site
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">
            Effective Date
          </h2>

          <p>
            Effective Date: July 2026
          </p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyScreen;
