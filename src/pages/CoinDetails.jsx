import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CardWallet from "../components/CardWallet";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import { FaTelegram } from "react-icons/fa";
import Swap from "../components/Swap";
import useGetMemecoin from "../hooks/useGetMemecoin";

const CoinDetails = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetMemecoin(id);
  const [currencyToggle, setCurrencyToggle] = useState("sui");
  const [priceToggle, setPriceToggle] = useState("sui");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { user: "suiwhale.sui", message: "just bought in! 🚀", time: "2m ago" },
    { user: "cryptoking", message: "this looks promising", time: "5m ago" },
    { user: "degen_ai", message: "holding for the moon", time: "8m ago" },
  ]);

  const transactions = [
    { type: "buy", suiAmount: 250, tokenAmount: 45000, price: 0.00000556, time: "12h ago", address: "0x1234567890abcdef1234567890abcdef12345678", nsName: null },
    { type: "sell", suiAmount: 100, tokenAmount: 18000, price: 0.00000556, time: "12h ago", address: "0xabcdef1234567890abcdef1234567890abcd", nsName: "suiwhale.sui" },
    { type: "buy", suiAmount: 500, tokenAmount: 90000, price: 0.00000556, time: "12h ago", address: "0x9876543210fedcba9876543210fedcba98765432", nsName: null },
    { type: "sell", suiAmount: 75, tokenAmount: 13500, price: 0.00000556, time: "12h ago", address: "0xdef0123456789abcdef0123456789abcdef01", nsName: null },
    { type: "buy", suiAmount: 25, tokenAmount: 4500, price: 0.00000556, time: "12h ago", address: "0x56789abcdef0123456789abcdef0123456789", nsName: "cryptoking.sui" },
  ];

  const suiPriceUSD = 5.50;
  const formatTotal = (suiAmount) => currencyToggle === "usd" ? `$${(suiAmount * suiPriceUSD).toFixed(2)}` : `${suiAmount} SUI`;
  const formatPrice = (price) => priceToggle === "usd" ? `$${(price * suiPriceUSD).toFixed(6)}` : price.toFixed(6);
  const formatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Unknown";

  // Stream URL - in production from data
  const streamUrl = null;
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/live/')) return `https://www.youtube.com/embed/${url.split('/live/')[1]?.split('?')[0]}`;
    if (url.includes('youtube.com/watch')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
    if (url.includes('twitch.tv/')) return `https://player.twitch.tv/?channel=${url.split('twitch.tv/')[1]?.split('?')[0]}&parent=localhost`;
    return null;
  };
  const embedUrl = getEmbedUrl(streamUrl || data?.streamUrl);

  useEffect(() => {
    if (!data?.ca) return;
    
    // Load DexScreener chart
    const container = document.getElementById('dexscreener-chart');
    if (container) {
      container.innerHTML = `<iframe src="https://dexscreener.com/sui/${data.ca}?embed=1&trades=0&info=0&chart=1" style="width:100%;height:350px;border:none;"></iframe>`;
    }
  }, [data?.ca]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatMessages([...chatMessages, { user: "You", message: chatMessage, time: "now" }]);
    setChatMessage("");
  };

  if (isError) return <div className="p-5 text-white">No Memecoin Found.</div>;

  return (
    <div className="rounded-lg">
      <div className="relative w-full flex flex-col items-center justify-center mb-4 rounded-sm p-3 md:p-8 bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-50%">
        
        {/* Header */}
        {isLoading ? (
          <div className="z-10 w-full bg-[rgba(0,0,0,0.5)] rounded-2xl p-8 animate-pulse h-32"></div>
        ) : (
          <div className="z-10 w-full flex flex-col md:flex-row gap-5 p-4 md:p-8 bg-[rgba(0,0,0,0.5)] rounded-2xl mb-6">
            <div className="flex-[49%] md:border-r border-[#9033F4] pr-6">
              <CardWallet cardDetails={data} />
            </div>
            <div className="flex-[49%]">
              <div className="bg-[rgba(0,0,0,0.5)] rounded-2xl p-4">
                <p className="text-sm"><span className="text-gray-400">Token:</span> <span className="text-white">{data?.name}</span></p>
                <p className="text-sm mt-1"><span className="text-gray-400">Ticker:</span> <span className="text-purple-400">{data?.symbol}</span></p>
                <p className="text-sm mt-1"><span className="text-gray-400">CA:</span> <span className="text-white font-mono text-xs">{data?.ca?.slice(0, 10)}...{data?.ca?.slice(-6)}</span> <button onClick={() => navigator.clipboard.writeText(data?.ca)} className="ml-2 text-purple-400 hover:text-purple-300">📋</button></p>
                {data?.desc && <p className="text-sm mt-2 text-gray-300">{data.desc}</p>}
              </div>
            </div>
            <div className="flex gap-4">
              {data?.twitter && <FaXTwitter className="text-xl text-gray-400" />}
              {data?.discord && <FaDiscord className="text-xl text-gray-400" />}
              {data?.telegram && <FaTelegram className="text-xl text-gray-400" />}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="flex flex-wrap gap-4 w-full p-4 mb-6">
          <div className="flex-1 min-w-[150px] bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
            <p className="text-gray-400 text-xs">Market Cap</p>
            <p className="text-xl font-bold text-white">${data?.marketCap || 45000}</p>
          </div>
          <div className="flex-1 min-w-[150px] bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
            <p className="text-gray-400 text-xs">Liquidity</p>
            <p className="text-xl font-bold text-white">${data?.liquidity || 12000}</p>
          </div>
          <div className="flex-1 min-w-[150px] bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
            <p className="text-gray-400 text-xs">24h Volume</p>
            <p className="text-xl font-bold text-green-400">${data?.volume24h || 8500}</p>
          </div>
          <div className="flex-1 min-w-[150px] bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
            <p className="text-gray-400 text-xs">Bonding Progress</p>
            <p className="text-xl font-bold text-purple-400">{data?.curveProgress || 65}%</p>
          </div>
        </div>

        {/* Bonding Curve */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Bonding Curve</span>
            <span>{data?.curveProgress || 65}%</span>
          </div>
          <div className="h-4 bg-[#1a1a24] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${data?.curveProgress || 65}%` }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row w-full gap-5">
          {/* Left */}
          <div className="flex-1 md:flex-2/3 flex flex-col gap-4">
            
            {/* Live Stream */}
            {embedUrl && (
              <div className="w-full h-[300px] bg-[#0a0a0a] rounded-2xl border border-purple-500/50 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 border-b border-purple-500/30">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-white text-sm font-semibold">📺 Live Stream</span>
                </div>
                <iframe src={embedUrl} className="w-full h-[250px]" frameBorder="0" allowFullScreen title="Live Stream"></iframe>
              </div>
            )}

            {/* Chart */}
            <div className="w-full h-[350px] bg-[#0a0a0a] rounded-2xl border border-[#27272a]">
              <div id="dexscreener-chart" className="w-full h-[350px] bg-[#1a1a24] rounded-xl"></div>
            </div>

            {/* Transactions */}
            <div className="bg-[#1a1a24] rounded-xl border border-[#27272a] p-4">
              <h3 className="text-white font-semibold mb-3">Transactions</h3>
              <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 font-medium pb-2 border-b border-[#333] mb-2">
                <div>Type</div>
                <div className="text-right">Total <button onClick={() => setCurrencyToggle(c => c === "sui" ? "usd" : "sui")} className="ml-1 text-purple-400">{currencyToggle.toUpperCase()}</button></div>
                <div className="text-right">{data?.symbol || "TOKEN"}</div>
                <div className="text-right">Price <button onClick={() => setPriceToggle(p => p === "sui" ? "usd" : "sui")} className="ml-1 text-purple-400">{priceToggle.toUpperCase()}</button></div>
                <div className="text-right">Wallet</div>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {transactions.map((tx, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 text-xs items-center p-2 bg-[#27272a] rounded-lg">
                    <div><span className={`px-2 py-0.5 rounded text-[10px] ${tx.type === 'buy' ? 'bg-green-600' : 'bg-red-600'} text-white`}>{tx.type.toUpperCase()}</span></div>
                    <div className="text-right text-white font-medium">{formatTotal(tx.suiAmount)}</div>
                    <div className="text-right text-gray-300">{tx.tokenAmount.toLocaleString()}</div>
                    <div className="text-right text-gray-400">${formatPrice(tx.price)}</div>
                    <div className="text-right">
                      <a href={`https://suiscan.xyz/address/${tx.address}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                        {tx.nsName || formatAddress(tx.address)}
                      </a>
                      <p className="text-gray-500 text-[10px]">{tx.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex-1 md:flex-1/3 flex flex-col gap-4">
            <Swap coinDetails={data} />
            
            {/* Chat */}
            <div className="bg-[#1a1a24] rounded-xl border border-[#27272a] p-4">
              <h3 className="text-white font-semibold mb-3">💬 Token Chat</h3>
              <div className="h-48 overflow-y-auto bg-[#27272a] rounded-lg p-2 mb-3 space-y-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-purple-400 font-semibold">{msg.user}:</span>
                    <span className="text-white ml-2">{msg.message}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Send a message..." className="flex-1 bg-[#27272a] text-white px-3 py-2 rounded-lg text-sm outline-none" />
                <button onClick={handleSendMessage} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetails;
