import React from "react";

interface AboutScreenProps {
  onBack: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">About FlashNews24</h1>

      <p className="text-gray-300 mb-4">
        FlashNews24 is a fast and reliable news platform delivering breaking
        news, world news, technology, business, sports, AI and local updates in
        real time.
      </p>

      <div className="space-y-2 text-sm text-gray-400">
        <p><b>Version:</b> 1.0.0</p>
        <p><b>Developer:</b> FlashNews24</p>
        <p><b>Website:</b> https://flashnews24.site</p>
        <p><b>Email:</b> flashnews24yt@gmail.com</p>
      </div>

      <button
        onClick={onBack}
        className="mt-8 w-full bg-blue-600 py-3 rounded-xl font-semibold"
      >
        ← Back
      </button>
    </div>
  );
};

export default AboutScreen;
