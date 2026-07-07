import React from "react";

interface ContactScreenProps {
  onBack: () => void;
}

const ContactScreen: React.FC<ContactScreenProps> = ({ onBack }) => {
  const open = (url: string) => window.open(url, "_blank");

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
          Contact Us
        </h1>
      </div>

      <div className="p-5 space-y-4">

        <button
          onClick={() => open("https://www.flashnews24.site")}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left"
        >
          🌐 Website
          <p className="text-sm text-gray-400 mt-1">
            flashnews24.site
          </p>
        </button>

        <button
          onClick={() => open("mailto:flashnews24yt@gmail.com")}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left"
        >
          📧 Email
          <p className="text-sm text-gray-400 mt-1">
            flashnews24yt@gmail.com
          </p>
        </button>

        <button
          onClick={() => open("https://www.facebook.com/share/1BUVE1TjWQ/")}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left"
        >
          📘 Facebook
        </button>

        <button
          onClick={() => open("https://www.instagram.com/flashnews24_live?igsh=ODFzdnBpdjVreHhq")}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left"
        >
          📸 Instagram
        </button>

        <button
          onClick={() => open("https://x.com/ebcnewss")}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left"
        >
          ❌ X (Twitter)
        </button>

        <button
          onClick={() => open("https://t.me/flashnews24news")}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left"
        >
          📢 Telegram
        </button>

        <button
          onClick={() => open("https://youtube.com/@flashnews24yt-b1t?si=raE1hYLjEp5zaQSp")}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left"
        >
          ▶️ YouTube
        </button>

      </div>

      <div className="text-center text-gray-500 text-sm py-8">
        FlashNews24 © 2026
      </div>

    </div>
  );
};

export default ContactScreen;
