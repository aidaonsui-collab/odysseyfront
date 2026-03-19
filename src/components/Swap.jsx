// Swap.jsx — Buy/Sell panel using Moonbags contract
import { useState, useEffect } from "react";
import PrimaryButton from "./buttons/PrimaryButton";
import { useWallet } from "@suiet/wallet-kit";
import { SuiClient } from "@mysten/sui/client";
import { useBuy, useSell } from "../hooks/useTrade";
import { SUI_RPC, TRADING_FEE_BPS, DEFAULT_SLIPPAGE_BPS } from "../constants/contracts";

const suiClient = new SuiClient({ url: SUI_RPC });

const Swap = ({ coinDetails }) => {
  const wallet   = useWallet();
  const executeBuy  = useBuy();
  const executeSell = useSell();

  const [tradeType, setTradeType]   = useState("buy");
  const [suiAmount, setSuiAmount]   = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [status, setStatus]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [suiBalance, setSuiBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenCoinIds, setTokenCoinIds] = useState([]);

  const tokenType  = coinDetails?.tokenType || coinDetails?.ca;
  const tokenPrice = coinDetails?.tokenPrice || 0.000045;
  const symbol     = coinDetails?.symbol || "TOKEN";
  const tradingFee = TRADING_FEE_BPS / 100;

  // Presets
  const presets = tradeType === "buy"
    ? [{ label: "0.5 SUI", value: 0.5 }, { label: "1 SUI", value: 1 },
       { label: "5 SUI",   value: 5   }, { label: "10 SUI", value: 10 }]
    : [{ label: "25%",  value: 25 }, { label: "50%", value: 50 },
       { label: "75%",  value: 75 }, { label: "MAX", value: 100 }];

  // Load balances when wallet connects
  useEffect(() => {
    if (!wallet.connected || !wallet.address) return;
    suiClient.getBalance({ owner: wallet.address, coinType: "0x2::sui::SUI" })
      .then(b => setSuiBalance(parseInt(b.totalBalance) / 1e9))
      .catch(() => {});
    if (tokenType) {
      suiClient.getCoins({ owner: wallet.address, coinType: tokenType })
        .then(res => {
          setTokenCoinIds(res.data.map(c => c.coinObjectId));
          setTokenBalance(res.data.reduce((s, c) => s + parseInt(c.balance), 0));
        })
        .catch(() => {});
    }
  }, [wallet.connected, wallet.address, tokenType]);

  const handleSuiChange = (e) => {
    const v = e.target.value;
    setSuiAmount(v);
    setTokenAmount(v && !isNaN(v) ? (parseFloat(v) / tokenPrice).toFixed(0) : "");
  };

  const handleTokenChange = (e) => {
    const v = e.target.value;
    setTokenAmount(v);
    setSuiAmount(v && !isNaN(v) ? (parseFloat(v) * tokenPrice).toFixed(6) : "");
  };

  const handlePreset = (val) => {
    if (tradeType === "sell") {
      const amt = Math.floor(tokenBalance * val / 100);
      setTokenAmount(amt.toString());
      setSuiAmount((amt * tokenPrice).toFixed(6));
    } else {
      setSuiAmount(val.toString());
      setTokenAmount((val / tokenPrice).toFixed(0));
    }
  };

  const handleTrade = async () => {
    if (!wallet.connected) { setStatus("⚠️ Connect your wallet"); return; }
    if (!tokenType)        { setStatus("❌ Token not on-chain yet"); return; }

    setLoading(true);
    setStatus("Building transaction...");

    try {
      if (tradeType === "buy") {
        const sui = parseFloat(suiAmount);
        if (!sui || sui <= 0) { setStatus("❌ Enter a SUI amount"); setLoading(false); return; }

        // Calculate min tokens out with slippage
        const estTokens = Math.floor(sui / tokenPrice);
        const minOut    = Math.floor(estTokens * (10000 - DEFAULT_SLIPPAGE_BPS) / 10000);

        setStatus("Waiting for wallet approval...");
        const result = await executeBuy({ wallet, tokenType, suiAmount: sui, minTokensOut: minOut });

        if (result?.effects?.status?.status === "success") {
          setStatus(`✅ Bought! Tx: ${result.digest.slice(0, 10)}...`);
          setSuiAmount("");
          setTokenAmount("");
        } else {
          setStatus(`⚠️ Submitted: ${result?.digest?.slice(0, 10)}...`);
        }
      } else {
        const tAmt = parseFloat(tokenAmount);
        if (!tAmt || tAmt <= 0) { setStatus("❌ Enter a token amount"); setLoading(false); return; }
        if (!tokenCoinIds.length) { setStatus("❌ No tokens in wallet"); setLoading(false); return; }

        const estSui   = Math.floor(tAmt * tokenPrice * 1e9);
        const minSuiOut = Math.floor(estSui * (10000 - DEFAULT_SLIPPAGE_BPS) / 10000);

        setStatus("Waiting for wallet approval...");
        const result = await executeSell({
          wallet, tokenType, tokenAmount: tAmt, minSuiOut,
        });

        if (result?.effects?.status?.status === "success") {
          setStatus(`✅ Sold! Tx: ${result.digest.slice(0, 10)}...`);
          setSuiAmount("");
          setTokenAmount("");
        } else {
          setStatus(`⚠️ Submitted: ${result?.digest?.slice(0, 10)}...`);
        }
      }
    } catch (err) {
      setStatus(`❌ ${(err?.message || "Failed").slice(0, 80)}`);
    }
    setLoading(false);
  };

  const feeAmt = suiAmount ? (parseFloat(suiAmount) * tradingFee / 100).toFixed(4) : "0";
  const isLive = !!tokenType && tokenType.length > 10;

  return (
    <div className="relative w-full p-[1px] bg-black rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] rounded-2xl" />
      <div className="relative flex flex-col px-5 py-6 gap-4 bg-black text-white rounded-2xl">

        {!isLive && (
          <div className="p-3 bg-yellow-900/30 border border-yellow-500/40 rounded-lg text-yellow-400 text-xs text-center">
            ⚠️ Token not yet on-chain — create pool to enable trading
          </div>
        )}

        {/* Buy / Sell tabs */}
        <div className="flex w-full gap-3">
          {["buy", "sell"].map(t => (
            <button key={t}
              onClick={() => setTradeType(t)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors capitalize ${
                tradeType === t
                  ? t === "buy" ? "bg-green-600" : "bg-red-600"
                  : "bg-[#1a1a24] text-gray-400 hover:bg-[#27272a]"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* You Pay */}
        <div className="flex flex-col p-4 bg-[#151515] rounded-xl">
          <div className="text-xs text-gray-400 mb-2">You Pay</div>
          <div className="flex gap-2">
            <input type="number" placeholder="0.00"
              value={tradeType === "buy" ? suiAmount : tokenAmount}
              onChange={tradeType === "buy" ? handleSuiChange : handleTokenChange}
              className="flex-1 bg-transparent text-white text-lg font-semibold outline-none" />
            <div className="bg-[#27272a] px-3 py-2 rounded-lg text-sm font-semibold">
              {tradeType === "buy" ? "SUI" : symbol}
            </div>
          </div>
          {wallet.connected && (
            <p className="text-[10px] text-gray-500 mt-1">
              Balance: {tradeType === "buy"
                ? `${suiBalance.toFixed(3)} SUI`
                : `${tokenBalance.toLocaleString()} ${symbol}`}
            </p>
          )}
        </div>

        {/* Presets */}
        <div className="flex w-full gap-2">
          {presets.map((p, i) => (
            <button key={i} onClick={() => handlePreset(p.value)}
              className="flex-1 py-2 bg-[#1a1a24] text-gray-400 text-xs rounded-lg hover:bg-[#27272a] transition-colors">
              {p.label}
            </button>
          ))}
        </div>

        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#27272a] self-center text-lg">↓</div>

        {/* You Receive */}
        <div className="flex flex-col p-4 bg-[#151515] rounded-xl">
          <div className="text-xs text-gray-400 mb-2">You Receive (est.)</div>
          <div className="flex gap-2">
            <input type="number" placeholder="0.00" readOnly
              value={tradeType === "buy" ? tokenAmount : suiAmount}
              className="flex-1 bg-transparent text-white text-lg font-semibold outline-none" />
            <div className="bg-[#27272a] px-3 py-2 rounded-lg text-sm font-semibold">
              {tradeType === "buy" ? symbol : "SUI"}
            </div>
          </div>
        </div>

        {/* Fee info */}
        <div className="p-3 bg-[#151515] rounded-xl space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Fee ({tradingFee}%)</span>
            <span>{feeAmt} SUI</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Slippage</span>
            <span>{DEFAULT_SLIPPAGE_BPS / 100}%</span>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className={`p-2 rounded-lg text-xs text-center ${
            status.startsWith("✅") ? "bg-green-900/50 text-green-400 border border-green-500/30" :
            status.startsWith("❌") ? "bg-red-900/50 text-red-400 border border-red-500/30" :
            "bg-purple-900/50 text-purple-300 border border-purple-500/30"
          }`}>
            {status}
          </div>
        )}

        <PrimaryButton
          name={loading ? "Processing..." : tradeType === "buy" ? "Buy Tokens" : "Sell Tokens"}
          handleOnClick={handleTrade}
          disabled={loading || !isLive}
        />
      </div>
    </div>
  );
};

export default Swap;
