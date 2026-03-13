import { useState, useEffect } from 'react';
import SecondaryButton from "../components/buttons/SecondaryButton";
import { PiPaperPlaneTilt, PiRobot } from "react-icons/pi";
import Header from "../components/Header";
import CardSlider from "../components/CardSlider";

// Generate mock tokens with dynamic bonding curve progress
const generateTokens = (count) => {
  const names = ['Zynix', 'Flareon', 'Aurum', 'Nebula', 'Quark', 'Vortex', 'Cryon', 'Solara', 'Lunox', 'Pyrax', 'Velora', 'Xyron', 'Zynther', 'Aetheris', 'Novara', 'Cryzen', 'Luminox', 'Vypera', 'Honk', 'SuiMeme'];
  const images = [
    '/assets/coin-img/coin_img_1.jpeg',
    '/assets/coin-img/coin_img_2.jpeg',
    '/assets/coin-img/coin_img_3.jpeg',
    '/assets/coin-img/coin_img_4.jpeg',
    '/assets/coin-img/coin_img_5.jpeg',
    '/assets/coin-img/coin_img_6.jpeg',
    '/assets/coin-img/coin_img_7.jpg',
    '/assets/coin-img/coin_img_8.jpg',
    '/assets/coin-img/coin_img_9.jpg',
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const progress = Math.random() * 100;
    const isBonded = progress >= 100;
    const mc = (Math.random() * 100).toFixed(2);
    const change = (Math.random() > 0.5 ? "+" : "-") + (Math.random() * 20).toFixed(1) + "%";
    
    return {
      id: Date.now() + i,
      image: images[Math.floor(Math.random() * images.length)],
      name: names[Math.floor(Math.random() * names.length)] + (i + 1),
      ca: "0x" + Math.random().toString(16).slice(2, 42),
      hasStream: Math.random() > 0.7,
      marketCap: mc,
      marketPercent: change,
      buyersPercent: (Math.random() * 10).toFixed(2) + "k",
      progress: progress,
      isBonded,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    };
  });
};

// Real TEST token from deployed contract
const realToken = {
  id: 999,
  image: '/assets/coin-img/coin_img_1.jpeg',
  name: 'TEST',
  ca: '0x6b954abcb604a0adcacf67d0a869dda10a52ae4dc52cbcb8bbe9929449df8aaf',
  hasStream: false,
  marketCap: '0.00',
  marketPercent: '+0.0%',
  buyersPercent: '0',
  progress: 0,
  isBonded: false,
  createdAt: new Date().toISOString(),
  isReal: true,
};

const Home = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const allTokens = generateTokens(30);
    // Add real TEST token at the beginning
    const testToken = {
      id: 999,
      image: '/assets/coin-img/coin_img_1.jpeg',
      name: 'TEST',
      ca: '0x6b954abcb604a0adcacf67d0a869dda10a52ae4dc52cbcb8bbe9929449df8aaf',
      hasStream: false,
      marketCap: '0.00',
      marketPercent: '+0.0%',
      buyersPercent: '0',
      progress: 5,
      isBonded: false,
      createdAt: new Date().toISOString(),
      isReal: true,
    };
    setTokens([testToken, ...allTokens]);
    
    const interval = setInterval(() => {
      const updated = generateTokens(30);
      const testToken = {
        id: 999,
        image: '/assets/coin-img/coin_img_1.jpeg',
        name: 'TEST',
        ca: '0x6b954abcb604a0adcacf67d0a869dda10a52ae4dc52cbcb8bbe9929449df8aaf',
        hasStream: false,
        marketCap: '0.00',
        marketPercent: '+0.0%',
        buyersPercent: '0',
        progress: 5,
        isBonded: false,
        createdAt: new Date().toISOString(),
        isReal: true,
      };
      setTokens([testToken, ...updated]);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getFilteredTokens = () => {
    switch (activeTab) {
      case 'new':
        return [...tokens].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'near':
        return tokens.filter(t => t.progress >= 50 && t.progress < 100).sort((a, b) => b.progress - a.progress);
      case 'bonded':
        return tokens.filter(t => t.isBonded);
      default:
        return tokens;
    }
  };

  const filteredTokens = getFilteredTokens();

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-400 to-green-600';
    if (progress >= 50) return 'from-yellow-400 to-orange-500';
    return 'from-purple-500 to-pink-500';
  };

  return (
    <div className="rounded-lg">
      {/* Hero Section */}
      <div className="relative w-full flex flex-col items-center justify-center mb-6 rounded-sm p-3 md:p-8 bg-black md:bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-50%">
        <div className="z-10 flex flex-col gap-5 md:gap-8 justify-between items-left md:items-center p-2 md:p-8 py-4 md:py-12 bg-[rgba(0,0,0,0.5)] rounded-2xl w-full">
          
          {/* Branding */}
          <div className="text-center w-full mb-2">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              TheOdyssey
            </h1>
            <p className="text-gray-400 text-sm md:text-lg">
              Sui Agentic Launchpad
            </p>
          </div>

          {/* Launch Options - Human & AI Agent */}
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
            {/* Human Launch */}
            <div className="flex-1 max-w-md bg-[#1a1a24]/80 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👤</span>
                <h3 className="font-semibold text-white">For Humans</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Launch your own memecoin in minutes. No coding required.
              </p>
              <SecondaryButton
                name="Launch a Coin"
                icon={<PiPaperPlaneTilt />}
                href="/create-coin"
                className="text-sm p-2 px-4 w-full justify-center"
              />
            </div>

            {/* AI Agent Launch */}
            <div className="flex-1 max-w-md bg-[#1a1a24]/80 rounded-xl p-4 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🤖</span>
                <h3 className="font-semibold text-white">For AI Agents</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Autonomous agents can launch tokens programmatically via API.
              </p>
              
              {/* API Endpoint Info */}
              <div className="bg-[#0a0a0f] rounded-lg p-3 mb-3 font-mono text-xs">
                <p className="text-cyan-400 mb-1">POST /api/v1/tokens/create</p>
                <p className="text-gray-500">Body: {"{"}"name": "Token", "ticker": "$SYM", "image": "https://...", "apiKey": "..."{"}"}</p>
              </div>
              
              <a
                href="/docs/ai-agent"
                className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all"
              >
                <PiRobot />
                Full API Docs
              </a>
            </div>
          </div>

          {/* API Info */}
          <div className="w-full mt-4 p-4 bg-[#0a0a0f]/80 rounded-xl border border-cyan-500/30">
            <p className="text-sm text-white font-semibold mb-2">
              🤖 <span className="text-cyan-400">AI Agent API Endpoint:</span>
            </p>
            <p className="text-xs text-gray-400 font-mono">
              POST https://theodyssey-backend.vercel.app/api/v1/tokens/create
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Body: {"{"}"name": "Token", "ticker": "$SYM", "image": "https://...", "apiKey": "..."{"}"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Full docs: <a href="/docs/ai-agent" className="text-purple-400 hover:underline">/docs/ai-agent</a>
            </p>
          </div>
        </div>
      </div>

      {/* Top 5 Trending Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">🔥 Top 5 Trending (24h Vol)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tokens.slice(0, 5).map((token) => (
            <div
              key={token.id}
              onClick={() => window.location.href = `/coins/${token.ca}`}
              className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a] hover:border-purple-500/50 transition-all cursor-pointer relative"
            >
              <a 
                href={`https://suiscan.xyz/address/${token.ca}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 text-gray-500 hover:text-purple-400"
                title="View Creator"
              >
                👤
              </a>
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={token.image} 
                  alt={token.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{token.name} {token.hasStream && <span className="text-red-500 ml-1">📺 LIVE</span>}</p>
                  <p className="text-xs text-gray-500">${(Math.random() * 50 + 5).toFixed(0)}K vol</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Curve</span>
                  <span className={token.isBonded ? "text-green-400 font-semibold" : "text-purple-400 font-semibold"}>
                    {token.progress.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 bg-[#27272a] rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getProgressColor(token.progress)}`}
                    style={{ width: `${Math.min(100, token.progress)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-4">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'new' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[#1a1a24] text-gray-400 hover:text-white'
            }`}
          >
            🆕 New Coins
          </button>
          <button
            onClick={() => setActiveTab('near')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'near' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-[#1a1a24] text-gray-400 hover:text-white'
            }`}
          >
            🔥 Near Bonding ({'>'}50%)
          </button>
          <button
            onClick={() => setActiveTab('bonded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'bonded' 
                ? 'bg-green-600 text-white' 
                : 'bg-[#1a1a24] text-gray-400 hover:text-white'
            }`}
          >
            🎯 Bonded
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredTokens.slice(0, 5).map((token) => (
            <div
              key={token.id}
              onClick={() => window.location.href = `/coins/${token.ca}`}
              className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a] hover:border-purple-500/50 transition-all cursor-pointer relative"
            >
              <a 
                href={`https://suiscan.xyz/address/${token.ca}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 text-gray-500 hover:text-purple-400"
                title="View Creator"
              >
                👤
              </a>
              <div className="flex items-center justify-between mb-2">
                <img 
                  src={token.image} 
                  alt={token.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                {token.isBonded ? (
                  <span className="text-xl">🎯</span>
                ) : (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                    LIVE
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm truncate">{token.name} {token.hasStream && <span className="text-red-500 ml-1">📺 LIVE</span>}</p>
              <p className="text-xs text-gray-500 mb-3">${token.marketCap}K</p>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Curve</span>
                  <span className={token.isBonded ? "text-green-400 font-semibold" : "text-purple-400 font-semibold"}>
                    {token.progress < 100 ? `${token.progress.toFixed(0)}%` : '100%'}
                  </span>
                </div>
                <div className="h-3 bg-[#27272a] rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getProgressColor(token.progress)}`}
                    style={{ width: `${Math.min(100, token.progress)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
