import { useState, useEffect } from 'react';

const generateStats = () => ({
  tokensCreated: Math.floor(Math.random() * 5000) + 1000,
  totalVolume: (Math.random() * 100 + 50).toFixed(2),
  tradingVolume: (Math.random() * 80 + 30).toFixed(2),
  rewardsPaid: (Math.random() * 10 + 2).toFixed(2),
});

const generateTokens = (count) => {
  const names = ['Zynix', 'Flareon', 'Aurum', 'Nebula', 'Quark', 'Vortex', 'Cryon', 'Solara', 'Lunox', 'Pyrax'];
  const images = ['/assets/coin-img/coin_img_1.jpeg', '/assets/coin-img/coin_img_2.jpeg', '/assets/coin-img/coin_img_3.jpeg'];
  
  return Array.from({ length: count }, (_, i) => {
    const progress = Math.random() * 100;
    return {
      id: i,
      image: images[i % images.length],
      name: names[i % names.length] + (i + 1),
      ca: "0x" + Math.random().toString(16).slice(2, 42),
      mc: (Math.random() * 100).toFixed(2),
      change: ((Math.random() - 0.3) * 100).toFixed(1),
      progress,
      isBonded: progress >= 100,
      holders: Math.floor(Math.random() * 500) + 10,
    };
  });
};

// Real TEST token
const realToken = {
  id: 999,
  image: '/assets/coin-img/coin_img_1.jpeg',
  name: 'TEST',
  ca: '0x6b954abcb604a0adcacf67d0a869dda10a52ae4dc52cbcb8bbe9929449df8aaf',
  mc: '0.00',
  change: '0.0',
  progress: 0,
  isBonded: false,
  holders: 1,
  isReal: true,
};

const generateTraders = (count) => {
  const nsNames = ['suiwhale.sui', 'cryptoking.sui', 'degen.sui', 'whaledefi.sui', null, null, null, null];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    address: "0x" + Math.random().toString(16).slice(2, 42),
    nsName: nsNames[Math.floor(Math.random() * nsNames.length)],
    pnl: ((Math.random() - 0.2) * 10000).toFixed(2),
    winRate: (Math.random() * 40 + 50).toFixed(1),
    trades: Math.floor(Math.random() * 500) + 50,
    volume: (Math.random() * 50 + 5).toFixed(2),
  })).sort((a, b) => parseFloat(b.pnl) - parseFloat(a.pnl));
};

const Stats = () => {
  const [timeframe, setTimeframe] = useState('24h');
  const [stats, setStats] = useState(generateStats());
  const [tokens, setTokens] = useState([]);
  const [bondedTokens, setBondedTokens] = useState([]);
  const [traders, setTraders] = useState([]);

  useEffect(() => {
    const allTokens = generateTokens(30);
    // Add real TEST token at the beginning
    allTokens.unshift(realToken);
    setTokens(allTokens.filter(t => !t.isBonded).sort((a, b) => parseFloat(b.change) - parseFloat(a.change)));
    setBondedTokens(allTokens.filter(t => t.isBonded).sort((a, b) => parseFloat(b.mc) - parseFloat(a.mc)));
    setTraders(generateTraders(10));
    
    const interval = setInterval(() => {
      setStats(generateStats());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatAddr = (addr) => addr.slice(0, 6) + '...' + addr.slice(-4);

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-6">
        {['24h', '7d', '30d'].map(t => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              timeframe === t ? 'bg-purple-600 text-white' : 'bg-[#1a1a24] text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-400">📊</span>
            <span className="text-gray-400 text-sm">Tokens Created</span>
          </div>
          <p className="text-2xl font-bold">{stats.tokensCreated.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">📈</span>
            <span className="text-gray-400 text-sm">Total Volume</span>
          </div>
          <p className="text-2xl font-bold">${stats.totalVolume}M</p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400">💹</span>
            <span className="text-gray-400 text-sm">Trading Volume</span>
          </div>
          <p className="text-2xl font-bold">${stats.tradingVolume}M</p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">🎁</span>
            <span className="text-gray-400 text-sm">Rewards Paid</span>
          </div>
          <p className="text-2xl font-bold">${stats.rewardsPaid}M</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">        
        <div className="bg-[#1a1a24] rounded-xl border border-[#27272a] overflow-hidden">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="text-green-400">🚀</span> Top Gainers (Not Bonded)
            </h3>
          </div>
          <div className="divide-y divide-[#27272a]">
            {tokens.slice(0, 5).map((token, i) => (
              <div key={token.id} className="p-3 flex items-center gap-3 hover:bg-[#27272a]/30">
                <span className="text-gray-500 w-6">{i + 1}</span>
                <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{token.name}</p>
                  <a href={`https://suiscan.xyz/address/${token.ca}`} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline">
                    {formatAddr(token.ca)}
                  </a>
                </div>
                <span className="text-green-400 font-bold text-sm">+{token.change}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a24] rounded-xl border border-[#27272a] overflow-hidden">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="text-yellow-400">🎯</span> Highest MarketCap (Bonded)
            </h3>
          </div>
          <div className="divide-y divide-[#27272a]">
            {bondedTokens.slice(0, 5).map((token, i) => (
              <div key={token.id} className="p-3 flex items-center gap-3 hover:bg-[#27272a]/30">
                <span className="text-gray-500 w-6">{i + 1}</span>
                <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{token.name}</p>
                  <a href={`https://suiscan.xyz/address/${token.ca}`} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline">
                    {formatAddr(token.ca)}
                  </a>
                </div>
                <span className="font-bold text-sm">${parseFloat(token.mc).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a24] rounded-xl border border-[#27272a] overflow-hidden md:col-span-2">
          <div className="p-4 border-b border-[#27272a]">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="text-purple-400">🏆</span> Top Traders by PnL
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#27272a] text-gray-400 text-sm">
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Wallet</th>
                  <th className="text-right p-3">PnL</th>
                  <th className="text-right p-3">Win Rate</th>
                  <th className="text-right p-3">Trades</th>
                  <th className="text-right p-3">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {traders.map((trader, i) => (
                  <tr key={trader.id} className="hover:bg-[#27272a]/30">
                    <td className="p-3">
                      {i === 0 && <span>🥇</span>}
                      {i === 1 && <span>🥈</span>}
                      {i === 2 && <span>🥉</span>}
                      {i > 2 && <span className="text-gray-500">{i + 1}</span>}
                    </td>
                    <td className="p-3">
                      <a href={`https://suiscan.xyz/address/${trader.address}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline font-mono text-sm">
                        {trader.nsName || formatAddr(trader.address)}
                      </a>
                    </td>
                    <td className={`p-3 text-right font-bold ${parseFloat(trader.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(trader.pnl) >= 0 ? '+' : ''}${trader.pnl}
                    </td>
                    <td className="p-3 text-right">{trader.winRate}%</td>
                    <td className="p-3 text-right text-gray-400">{trader.trades}</td>
                    <td className="p-3 text-right">${trader.volume}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stats;
