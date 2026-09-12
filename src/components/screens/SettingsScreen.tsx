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
    <div className="min-h-screen bg-[#070809] text-white p-5">
      <button
        onClick={onBack}
        className="mb-6 text-red-400 font-semibold"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-black mb-6 tracking-tight">⚙️ Settings</h1>

      <div className="space-y-4">

        <button
          onClick={openNotifications}
          className="w-full bg-[#111214] border border-[#252629] rounded-2xl p-4 text-left hover:bg-red-600/10 shadow-lg shadow-red-950/10"
        >
          🔔 Notifications
        </button>

        <button
          onClick={shareApp}
          className="w-full bg-[#111214] border border-[#252629] rounded-2xl p-4 text-left hover:bg-red-600/10 shadow-lg shadow-red-950/10"
        >
          📤 Share App
        </button>

        <button
          onClick={rateApp}
          className="w-full bg-[#111214] border border-[#252629] rounded-2xl p-4 text-left hover:bg-red-600/10 shadow-lg shadow-red-950/10"
        >
          ⭐ Rate App
        </button>

        <button
          onClick={openWebsite}
          className="w-full bg-[#111214] border border-[#252629] rounded-2xl p-4 text-left hover:bg-red-600/10 shadow-lg shadow-red-950/10"
        >
          🌐 Visit Website
        </button>

        <button
          onClick={clearCache}
          className="w-full bg-[#111214] rounded-xl p-4 text-left text-red-400 hover:bg-red-600/10"
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
