// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Coins from "./pages/Coins";
import CoinDetails from "./pages/CoinDetails";
import Leaderboard from "./pages/Leaderboard";
import CreateCoin from "./pages/CreateCoin";
import useAuthStore from "./store/authStore";
import { useEffect } from "react";
import useAuthCheck from "./hooks/useAuthCheck";
import Layout from "./components/Layout";
import DexScreener from "./pages/DexScreener";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import AiAgentDocs from "./pages/docs/AiAgentDocs";
import Stats from "./pages/Stats";
import Stake from "./pages/Stake";

const App = () => {
  const { isAuthenticated } = useAuthCheck();

  useEffect(() => {
    // console.log("IsAuthenticated: ", isAuthenticated)
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Other Pages */}
          <Route path="/coins" element={<Coins />} />
          <Route path="/coins/:id" element={<CoinDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/create-coin" element={<CreateCoin />} />
          <Route path="/dexscreener" element={<DexScreener />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/about" element={<About />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/stake" element={<Stake />} />
          <Route path="/docs/ai-agent" element={<AiAgentDocs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;