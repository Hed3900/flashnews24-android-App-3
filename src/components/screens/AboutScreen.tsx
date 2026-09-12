import React from "react";

interface AboutScreenProps {
  onBack: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#070809] text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0B0C0E] border-b border-[#252629] p-4 flex items-center">
        <button
          onClick={onBack}
          className="text-red-400 font-semibold mr-4"
        >
          ← Back
      </button>

        <h1 className="text-xl font-black tracking-tight">
          About FlashNews24
        </h1>
      </div>

      <div className="p-5">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-red-600 flex items-center justify-center text-4xl">
            🔥
          </div>

          <h2 className="text-2xl font-black mt-4 tracking-tight">
            FlashNews24
          </h2>

          <p className="text-gray-400 text-center mt-2">
            Fast • Trusted • Breaking News
          </p>
        </div>

        {/* About */}
        <div className="bg-[#111214] border border-[#252629] shadow-lg shadow-red-950/20 rounded-2xl p-5 mb-5 border border-[#252629] shadow-lg shadow-red-950/10">
          <h3 className="font-black text-lg mb-3 text-white">
            About
          </h3>

          <p className="text-gray-300 leading-8">
            FlashNews24 delivers breaking news from around the world,
            including politics, technology, business, sports, AI,
            entertainment and local updates.

            Our goal is to provide fast, accurate and reliable news with
            a clean reading experience and offline support.
          </p>
        </div>

        {/* App Information */}
        <div className="bg-[#111214] border border-[#252629] shadow-lg shadow-red-950/20 rounded-2xl p-5 mb-5 border border-[#252629] shadow-lg shadow-red-950/10">

          <h3 className="font-black text-lg mb-4 text-white">
            App Information
          </h3>

          <div className="space-y-3">

            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span>1.0.0</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Developer</span>
              <span>FlashNews24</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Website</span>
              <span className="text-red-400">
                flashnews24.site
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-red-400">
                flashnews24yt@gmail.com
              </span>
            </div>

          </div>
        </div>

        {/* Features */}
        <div className="bg-[#111214] border border-[#252629] shadow-lg shadow-red-950/20 rounded-2xl p-5 mb-5 border border-[#252629] shadow-lg shadow-red-950/10">

          <h3 className="font-black text-lg mb-3 text-white">
            Features
          </h3>

          <div className="space-y-2 text-gray-300">

            <p>✅ Live Breaking News</p>
            <p>✅ Offline Reading</p>
            <p>✅ Room Database</p>
            <p>✅ Smart Search</p>
            <p>✅ Bookmark Articles</p>
            <p>✅ Push Notifications</p>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8 mb-6">
          © 2026 FlashNews24
          <br />
          Made with ❤️ for faster news delivery.
        </div>

        <button
          onClick={onBack}
          className="w-full bg-red-600 shadow-lg shadow-red-900/30 hover:bg-red-700 rounded-xl py-4 font-bold text-lg"
        >
          ← Back to Home
        </button>

      </div>
    </div>
  );
};

export default AboutScreen;
