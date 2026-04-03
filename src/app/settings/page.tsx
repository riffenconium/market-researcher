"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [defaultAutonomy, setDefaultAutonomy] = useState("guided");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setDefaultAutonomy(data.defaultAutonomy || "guided");
      });
  }, []);

  const handleSave = async () => {
    const updates: Record<string, string> = { defaultAutonomy };
    if (geminiKey) updates.geminiApiKey = geminiKey;

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Gemini API Key</h2>
          <Input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
          />
          <p className="text-xs text-gray-400 mt-1">
            Set GEMINI_API_KEY in your .env.local file for persistent configuration.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Default Autonomy Level</h2>
          <select
            value={defaultAutonomy}
            onChange={(e) => setDefaultAutonomy(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="autonomous">Fully Autonomous</option>
            <option value="guided">Guided</option>
            <option value="checkpoint">Checkpoint</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Save Settings</Button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
