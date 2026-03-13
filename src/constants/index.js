export const navigation = [
  {
    id: "0",
    title: "Coins",
    url: "/coins",
  },
  {
    id: "1",
    title: "💰 Stake",
    url: "/stake",
  },
  {
    id: "2",
    title: "📊 Stats",
    url: "/stats",
  },
  {
    id: "3",
    title: "About",
    url: "/about",
  },
  {
    id: "4",
    title: "🤖 AI Docs",
    url: "/docs/ai-agent",
  },
];

export const allCoins = [
  { id: 1, name: 'Zynix', symbol: '$ZYNIX', price: 0.00001234, change: 5.67 },
  { id: 2, name: 'Flareon', symbol: '$FLARE', price: 0.00005678, change: -2.34 },
  { id: 3, name: 'Aurum', symbol: '$AUR', price: 0.00002345, change: 12.56 },
];

// Coin images
export const coin1 = "/assets/coin-img/coin_img_1.jpeg";
export const coin2 = "/assets/coin-img/coin_img_2.jpeg";
export const coin3 = "/assets/coin-img/coin_img_3.jpeg";
export const coin4 = "/assets/coin-img/coin_img_4.jpeg";
export const coin5 = "/assets/coin-img/coin_img_5.jpeg";
export const coin6 = "/assets/coin-img/coin_img_6.jpeg";
export const coin7 = "/assets/coin-img/coin_img_7.jpg";
export const coin8 = "/assets/coin-img/coin_img_8.jpg";
export const coin9 = "/assets/coin-img/coin_img_9.jpg";

export const coinChartData = [
  { time: '2024-01-01', value: 1000 },
  { time: '2024-01-02', value: 1200 },
  { time: '2024-01-03', value: 1100 },
  { time: '2024-01-04', value: 1400 },
  { time: '2024-01-05', value: 1600 },
];

export const singleCoinDetails = {
  id: 1,
  name: 'Zynix',
  symbol: '$ZYNIX',
  description: 'The future of memetics on Sui',
  image: coin1,
  creator: '0x1234567890abcdef1234567890abcdef12345678',
  marketCap: 45000,
  liquidity: 12000,
  holders: 156,
  price: 0.000045,
  volume24h: 8500,
  curveProgress: 65.5,
};

// Common exports that might be needed
export const socials = {
  twitter: 'https://x.com',
  telegram: 'https://t.me',
  website: 'https://',
};

export const network = {
  name: 'Sui Mainnet',
  rpc: 'https://rpc.mainnet.sui.io',
  explorer: 'https://suiscan.xyz',
};

export const bondingCurve = {
  virtualSuiReserves: 1000,
  virtualTokenReserves: 1000000,
  initialPrice: 0.0001,
  slope: 1,
};
