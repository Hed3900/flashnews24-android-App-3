import React from "react";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const shareApp = async () => {
    const text =
      "Download FlashNews24 App:\nhttps://play.google.com/store/apps/details?id=com.flashnews24.app";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "FlashNews24",
          text,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert("App link copied!");
    }
  };

  const rateApp = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=com.flashnews24.app",
      "_blank"
    );
  };

  const openWebsite = () => {
    window.open("https://flashnews24.site", "_blank");
  };

  const openNotifications = () => {
    alert("Notifications feature coming soon.");
  };

  const clearCache = () => {
    localStorage.clear();
    alert("Cache Cleared Successfully");
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-5">
      <button
        onClick={onBack}
        className="mb-6 text-blue-400 font-semibold"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">⚙️ Settings</h1>

      <div className="space-y-4">

        <button
          onClick={openNotifications}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left hover:bg-[#232933]"
        >
          🔔 Notifications
        </button>

        <button
          onClick={shareApp}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left hover:bg-[#232933]"
        >
          📤 Share App
        </button>

        <button
          onClick={rateApp}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left hover:bg-[#232933]"
        >
          ⭐ Rate App
        </button>

        <button
          onClick={openWebsite}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left hover:bg-[#232933]"
        >
          🌐 Visit Website
        </button>

        <button
          onClick={clearCache}
          className="w-full bg-[#1A1D23] rounded-xl p-4 text-left text-red-400 hover:bg-[#232933]"
        >
          🗑️ Clear Cache
        </button>

      </div>

      <div className="mt-10 text-center text-gray-500">
        <p className="font-semibold">FlashNews24 v1.0.0</p>
        <p className="text-sm mt-2">
          Fast • Trusted • Breaking News
        </p>
      </div>
    </div>
  );
};

export default SettingsScreen;
