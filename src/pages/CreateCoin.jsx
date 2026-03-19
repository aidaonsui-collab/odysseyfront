// CreateCoin.jsx — TheOdyssey.fun Token Launcher
// ============================================================
// Two wallet signatures:
//   Sig 1: Publish coin module on-chain
//   Sig 2: Call moonbags::create (creates bonding curve pool)
// No CLI. No TreasuryCap paste. No backend needed.
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useWallet } from "@suiet/wallet-kit";
import { useCreateToken } from "../hooks/useCreateToken";

const DEX_OPTIONS = [
  { value: 0, label: "🌊 Cetus",   desc: "Graduates to Cetus DEX at 3 SUI" },
  { value: 1, label: "⚡ Turbos",  desc: "Graduates to Turbos DEX at 3 SUI" },
];

// Step indicator
const Steps = ({ current }) => {
  const steps = ["Details", "Approve Publish", "Approve Pool"];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
            i < current  ? "bg-green-600 border-green-500 text-white" :
            i === current ? "bg-purple-700 border-purple-400 text-white" :
            "bg-gray-800 border-gray-700 text-gray-500"
          }`}>
            {i < current ? "✓" : i + 1}
          </div>
          <span className={`text-xs hidden sm:block ${i === current ? "text-purple-300" : "text-gray-600"}`}>{s}</span>
          {i < steps.length - 1 && <div className={`w-4 h-px mx-1 ${i < current ? "bg-green-500" : "bg-gray-700"}`} />}
        </div>
      ))}
    </div>
  );
};

const CreateCoin = () => {
  const navigate = useNavigate();
  const wallet   = useWallet();
  const { createToken, loading, status } = useCreateToken();

  const [step, setStep]     = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl]     = useState("");
  const [uploading, setUploading]   = useState(false);

  const [form, setForm] = useState({
    name: "", ticker: "", desc: "",
    twitter: "", telegram: "", website: "",
    dex: 0,
    initialSui: "0",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Image upload to Cloudinary
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "launchpad");
      fd.append("folder", "launchpad");
      const res = await axios.post("https://api.cloudinary.com/v1_1/dtgdfntom/image/upload", fd);
      setImageUrl(res.data.secure_url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed");
    }
    setUploading(false);
  };

  const handleCreate = async () => {
    if (!wallet.connected) { toast.error("Connect your wallet first"); return; }
    if (!form.name || !form.ticker || !form.desc) {
      toast.error("Name, ticker, and description are required");
      return;
    }

    setStep(1); // show Sig 1 step

    try {
      const result = await createToken({
        wallet,
        name:        form.name,
        symbol:      form.ticker.toUpperCase(),
        description: form.desc,
        imageUrl:    imageUrl || "",
        twitter:     form.twitter,
        telegram:    form.telegram,
        website:     form.website,
        initialSui:  parseFloat(form.initialSui) || 0,
      });

      setStep(2); // show Sig 2 step (fires quickly after)
      toast.success(`🚀 ${form.name} launched!`);

      if (result?.poolId) {
        setTimeout(() => navigate(`/coins/${result.poolId}`), 1500);
      } else {
        setTimeout(() => navigate("/coins"), 1500);
      }
    } catch (err) {
      toast.error(err?.message?.slice(0, 100) || "Error creating token");
      setStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-4 md:p-10">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🚀 Launch Your Token</h1>
          <p className="text-gray-400">Two wallet signatures. Fully on-chain. Bonding curve starts immediately.</p>
        </div>

        <Steps current={step} />

        {/* Status banner when in progress */}
        {loading && status && (
          <div className="mb-6 p-4 bg-purple-900/40 border border-purple-500/40 rounded-xl text-purple-300 text-sm text-center animate-pulse">
            {status}
          </div>
        )}

        <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 border border-gray-800">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Left — image + curve info */}
            <div>
              <div className="aspect-square bg-gradient-to-br from-purple-600 to-[#161616] rounded-xl flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Token" className="w-full h-full object-cover" />
                ) : (
                  <label className="cursor-pointer text-center p-4">
                    <div className="text-5xl mb-3">{uploading ? "⏳" : "🖼️"}</div>
                    <p className="text-sm text-gray-300 font-semibold">
                      {uploading ? "Uploading..." : "Upload Token Image"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  </label>
                )}
              </div>
              {previewUrl && !uploading && (
                <label className="mt-2 block text-center text-xs text-purple-400 cursor-pointer">
                  Change image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
              )}

              <div className="mt-4 p-4 bg-[#0f0f0f] rounded-xl border border-purple-500/20 space-y-2">
                <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Bonding Curve</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Graduation threshold</span><span className="text-white">3 SUI</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Creation fee</span><span className="text-white">0.01 SUI</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Trading fee</span><span className="text-white">2%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Wallet signatures</span><span className="text-white">2 (publish + create)</span>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="space-y-4">
              <input type="text" placeholder="Token Name *" value={form.name}
                onChange={e => set("name", e.target.value)}
                className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white focus:border-purple-500 outline-none" />

              <input type="text" placeholder="Ticker Symbol * (e.g. PEPE)" value={form.ticker}
                onChange={e => set("ticker", e.target.value.toUpperCase())} maxLength={10}
                className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white uppercase focus:border-purple-500 outline-none" />

              <textarea placeholder="Description *" value={form.desc}
                onChange={e => set("desc", e.target.value)} rows={3}
                className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white resize-none focus:border-purple-500 outline-none" />

              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Twitter" value={form.twitter}
                  onChange={e => set("twitter", e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white focus:border-purple-500 outline-none text-sm" />
                <input type="text" placeholder="Telegram" value={form.telegram}
                  onChange={e => set("telegram", e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white focus:border-purple-500 outline-none text-sm" />
              </div>

              <input type="text" placeholder="Website" value={form.website}
                onChange={e => set("website", e.target.value)}
                className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white focus:border-purple-500 outline-none" />

              {/* DEX selector */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Migration DEX</p>
                <div className="flex gap-3">
                  {DEX_OPTIONS.map(opt => (
                    <label key={opt.value} className={`flex-1 flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition-colors ${
                      form.dex === opt.value ? "border-purple-500 bg-purple-900/20" : "border-gray-700 hover:border-gray-500"
                    }`}>
                      <input type="radio" name="dex" checked={form.dex === opt.value}
                        onChange={() => set("dex", opt.value)} className="accent-purple-500" />
                      <div>
                        <p className="text-xs text-white font-medium">{opt.label}</p>
                        <p className="text-[10px] text-gray-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional first buy */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Initial Buy (optional, SUI)</p>
                <input type="number" min="0" step="0.1" placeholder="0" value={form.initialSui}
                  onChange={e => set("initialSui", e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white focus:border-purple-500 outline-none" />
                <p className="text-[10px] text-gray-500 mt-1">Included in the pool creation tx. Creator gets first-mover advantage.</p>
              </div>

              {/* Status when not loading */}
              {!loading && status && (
                <div className={`p-3 rounded-xl text-xs text-center border ${
                  status.startsWith("✅") ? "bg-green-900/30 border-green-500/30 text-green-400" :
                  status.startsWith("❌") ? "bg-red-900/30 border-red-500/30 text-red-400" :
                  "bg-gray-900/30 border-gray-700 text-gray-400"
                }`}>
                  {status}
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={loading || uploading || !wallet.connected}
                className="w-full p-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {loading      ? "Launching..." :
                 uploading    ? "Uploading image..." :
                 !wallet.connected ? "Connect Wallet" :
                 "🚀 Launch Token (2 signatures)"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoin;
