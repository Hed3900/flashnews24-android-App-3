import React from "react";

interface TermsScreenProps {
  onBack: () => void;
}

const TermsScreen: React.FC<TermsScreenProps> = ({ onBack }) => {
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
          Terms & Conditions
        </h1>
      </div>

      <div className="p-5 space-y-6 text-gray-300 leading-7">

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            1. Acceptance of Terms
          </h2>

          <p>
            By downloading or using FlashNews24, you agree to comply with
            these Terms and Conditions. If you do not agree, please stop
            using the application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            2. News Content
          </h2>

          <p>
            FlashNews24 aggregates news from publicly available and licensed
            sources. News content is provided for informational purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            3. User Responsibilities
          </h2>

          <ul className="list-disc ml-6 space-y-2">
            <li>Use the application responsibly.</li>
            <li>Do not misuse or interfere with the service.</li>
            <li>Respect copyright and intellectual property rights.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            4. Intellectual Property
          </h2>

          <p>
            FlashNews24 branding, design, source code and original content
            are protected under applicable copyright and trademark laws.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            5. Disclaimer
          </h2>

          <p>
            Although we strive for accuracy, FlashNews24 cannot guarantee
            that all news articles are complete, accurate or up to date at
            all times.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            6. Limitation of Liability
          </h2>

          <p>
            FlashNews24 shall not be liable for any direct, indirect,
            incidental or consequential damages arising from the use of
            this application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            7. Updates
          </h2>

          <p>
            These Terms may be updated periodically. Continued use of the
            application constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            8. Contact
          </h2>

          <p>Website: https://flashnews24.site</p>
          <p>Email: support@flashnews24.site</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">
            Effective Date
          </h2>

          <p>July 2026</p>
        </section>

      </div>

    </div>
  );
};

export default TermsScreen;
