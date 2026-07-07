import React from "react";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-5">
      <button
        onClick={onBack}
        className="mb-6 text-blue-400 font-semibold"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">⚙️ Settings</h1>

      <div className="space-y-4">

        <button className="w-full bg-[#1A1D23] rounded-xl p-4 text-left">
          🔔 Notifications
        </button>

        <button className="w-full bg-[#1A1D23] rounded-xl p-4 text-left">
          📤 Share App
        </button>

        <button className="w-full bg-[#1A1D23] rounded-xl p-4 text-left">
          ⭐ Rate App
        </button>

        <button className="w-full bg-[#1A1D23] rounded-xl p-4 text-left">
          🌐 Visit Website
        </button>

        <button className="w-full bg-[#1A1D23] rounded-xl p-4 text-left text-red-400">
          🗑️ Clear Cache
        </button>

      </div>

      <p className="text-center text-gray-500 mt-10">
        FlashNews24 v1.0.0
      </p>
    </div>
  );
};

export default SettingsScreen;
