import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useWallet } from "@suiet/wallet-kit";

const CreateCoin = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { connected, address } = wallet;
  
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [desc, setDesc] = useState("");
  const [xSocial, setXSocial] = useState("");
  const [telegramSocial, setTelegramSocial] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useApiKey, setUseApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedDex, setSelectedDex] = useState("cetus");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "launchpad");
      formData.append("folder", "launchpad");
      try {
        const res = await axios.post("https://api.cloudinary.com/v1_1/dtgdfntom/image/upload", formData);
        setFileUrl(res.data.secure_url);
        toast.success("Image uploaded!");
      } catch (err) { toast.error("Upload failed"); } 
      finally { setLoading(false); }
    }
  };

  const handleCreate = async () => {
    if (useApiKey && !apiKey) { toast.error("Enter API key"); return; }
    if (!useApiKey && !connected) { toast.error("Connect wallet"); return; }
    if (!name || !ticker || !desc) { toast.error("Fill required fields"); return; }

    setLoading(true);
    try {
      const coinType = `${address}::${ticker.toLowerCase()}::${ticker.toUpperCase()}`;
      
      if (!useApiKey && connected && address) {
        console.log("Building transaction...");
        try {
          const { Transaction } = await import('@mysten/sui/transactions');
          const tx = new Transaction();
          
          // Create coin - basic token creation
          tx.moveCall({
            target: '0x2::coin::create_currency',
            arguments: [],
            typeArguments: [coinType],
          });

          console.log("Signing...");
          const result = await wallet.signAndExecuteTransactionBlock({ transactionBlock: tx });
          console.log("Success:", result);
          toast.success("Token created on blockchain!");
        } catch (txError) {
          console.error("Tx error:", txError);
          toast.error("Tx failed: " + txError.message);
        }
      }

      await axios.post(
        "https://theodyssey-backend-production.up.railway.app/api/v1/memecoins/create",
        { name, ticker, creator: useApiKey ? null : address, image: fileUrl, desc, totalCoins: 30, xSocial, telegramSocial, websiteUrl, streamUrl, apiKey: useApiKey ? apiKey : null, isAgent: useApiKey, dex: selectedDex, coinAddress: coinType }
      );
      toast.success("Token created!");
      navigate("/coins/" + coinType);
    } catch (err) { toast.error(err.message || "Error"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Launch Your Memecoin</h1>
          <p className="text-gray-400">Create and deploy on Sui blockchain</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 border border-gray-800">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="aspect-square bg-gradient-to-br from-orange-500 to-[#161616] rounded-xl flex items-center justify-center">
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : (
                  <label className="cursor-pointer text-center p-4">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm text-gray-300">Choose Image</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Token Name *" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white" />
              <input type="text" placeholder="Ticker *" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} maxLength={10} className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white uppercase" />
              <textarea placeholder="Description *" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white h-24" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Twitter" value={xSocial} onChange={(e) => setXSocial(e.target.value)} className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white" />
                <input type="text" placeholder="Telegram" value={telegramSocial} onChange={(e) => setTelegramSocial(e.target.value)} className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white" />
              </div>
              <input type="text" placeholder="Website" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white" />
              <input type="text" placeholder="Live Stream" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white" />
              <select value={selectedDex} onChange={(e) => setSelectedDex(e.target.value)} className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white">
                <option value="cetus">Cetus</option>
                <option value="turbos">Turbos</option>
                <option value="alex">Alex</option>
              </select>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="agent" checked={useApiKey} onChange={(e) => setUseApiKey(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="agent" className="text-sm text-gray-300">Use AI Agent</label>
              </div>
              {useApiKey && <input type="password" placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full p-3 rounded-xl bg-[#2A2A2A] border border-gray-700 text-white" />}
              <button onClick={handleCreate} disabled={loading} className="w-full p-4 rounded-xl font-bold text-lg text-white mt-4 bg-gradient-to-r from-purple-600 to-pink-600">
                {loading ? "Creating..." : connected || useApiKey ? "Create Token" : "Connect Wallet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoin;
