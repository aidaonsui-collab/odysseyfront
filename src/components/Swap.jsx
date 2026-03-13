import { useState } from "react";
import PrimaryButton from "./buttons/PrimaryButton";
import { useWallet } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID = '0x50e60400cc2ea760b5fb8380fa3f1fc0a94dfc592ec78487313d21b50af846da';
const CONFIG_ID = '0x202f7e8fe6c22cd4e34f969c435e90f677ae40447be04b653aa880d9e1c37754';

const Swap = ({ coinDetails }) => {
  const wallet = useWallet();
  const [tradeType, setTradeType] = useState("buy");
  const [amount, setAmount] = useState("");
  const [suiAmount, setSuiAmount] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  
  const tokenPrice = 0.000045;
  const tradingFee = 2;

  const presets = tradeType === "sell" 
    ? [{ label: "25%", value: 25 }, { label: "50%", value: 50 }, { label: "75%", value: 75 }, { label: "MAX", value: 100 }] 
    : [{ label: "1 SUI", value: 1 }, { label: "10 SUI", value: 10 }, { label: "25 SUI", value: 25 }, { label: "100 SUI", value: 100 }];

  const calculateTokenAmount = (suiValue) => {
    if (!suiValue || isNaN(suiValue)) return "";
    return (suiValue / tokenPrice).toFixed(2);
  };

  const calculateSuiAmount = (tokenValue) => {
    if (!tokenValue || isNaN(tokenValue)) return "";
    return (tokenValue * tokenPrice).toFixed(6);
  };

  const handleSuiChange = (e) => {
    const value = e.target.value;
    setSuiAmount(value);
    setAmount(calculateTokenAmount(value));
  };

  const handleTokenChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setSuiAmount(calculateSuiAmount(value));
  };

  const handlePreset = (presetValue) => {
    if (tradeType === "sell") {
      const tokenBalance = 10000;
      const sellAmount = (tokenBalance * presetValue / 100);
      setAmount(sellAmount.toFixed(2));
      setSuiAmount(calculateSuiAmount(sellAmount));
    } else {
      setSuiAmount(presetValue.toString());
      setAmount(calculateTokenAmount(presetValue));
    }
  };

  const handleTrade = async () => {
    console.log("handleTrade called", { wallet: wallet.connected, coinDetails, tradeType });
    
    if (!wallet.connected) {
      setStatus("Please connect your wallet first!");
      return;
    }
    if (!coinDetails?.ca) {
      console.log("coinDetails:", coinDetails);
      setStatus("Token address not found! Token may not exist on contract.");
      return;
    }
    
    setLoading(true);
    setStatus("Processing...");
    
    try {
      const tx = new Transaction();
      
      if (tradeType === "buy") {
        // Buy: Pay SUI, receive tokens
        const suiValue = parseFloat(suiAmount);
        if (!suiValue || suiValue <= 0) {
          setStatus("Invalid SUI amount!");
          setLoading(false);
          return;
        }
        
        const amountMIST = Math.floor(suiValue * 1e9);
        
        // Get gas coin and split - use number directly
        const gasCoin = tx.gas;
        const [paymentCoin] = tx.splitCoins(gasCoin, [amountMIST]);
        
        // Call moonbags::buy(configuration, coin_sui, amount_out, ctx)
        const estimatedTokens = Math.floor(suiValue / tokenPrice);
        
        tx.moveCall({
          target: `${PACKAGE_ID}::moonbags::buy`,
          arguments: [
            tx.object(CONFIG_ID),
            paymentCoin,
            tx.pure.u64(estimatedTokens),
          ],
        });
      } else {
        // Sell: Need to get the user's token coin object first
        setStatus("Sell requires token coin object. Use CLI for now.");
        setLoading(false);
        return;
      }

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      setStatus(`Success! Tx: ${result.digest.slice(0, 8)}...`);
    } catch (error) {
      console.error("Trade error:", error);
      setStatus(`Error: ${error.message?.slice(0, 50) || "Transaction failed"}`);
    }
    
    setLoading(false);
  };

  const feeAmount = suiAmount ? (parseFloat(suiAmount) * tradingFee / 100).toFixed(4) : "0";

  return (
    <div className="relative w-full p-[1px] flex gap-3 bg-black rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-[#EC8AEF] to-[#9033F4] rounded-2xl"></div>
      <div className="relative w-full flex flex-col justify-center items-center px-5 py-6 gap-4 bg-black text-white rounded-2xl">
        
        <div className="flex w-full gap-3">
          <button
            onClick={() => setTradeType("buy")}
            className={`flex-1 py-3 rounded-lg font-semibold ${tradeType === "buy" ? "bg-green-600" : "bg-[#1a1a24] text-gray-400"}`}
          >
            Buy
          </button>
          <button
            onClick={() => setTradeType("sell")}
            className={`flex-1 py-3 rounded-lg font-semibold ${tradeType === "sell" ? "bg-red-600" : "bg-[#1a1a24] text-gray-400"}`}
          >
            Sell
          </button>
        </div>

        <div className="flex flex-col p-4 bg-[#151515] rounded-xl w-full">
          <div className="text-xs text-gray-400 mb-2">You Pay</div>
          <div className="flex gap-2">
            <input
              type="number"
              value={tradeType === "buy" ? suiAmount : amount}
              onChange={tradeType === "buy" ? handleSuiChange : handleTokenChange}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white text-lg font-semibold outline-none"
            />
            <div className="bg-[#27272a] px-3 py-2 rounded-lg text-sm font-semibold">
              {tradeType === "buy" ? "SUI" : coinDetails?.symbol || "TOKEN"}
            </div>
          </div>
        </div>

        <div className="flex w-full gap-2">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePreset(p.value)}
              className="flex-1 py-2 bg-[#1a1a24] text-gray-400 text-xs font-medium rounded-lg"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#27272a]">↓</div>

        <div className="flex flex-col p-4 bg-[#151515] rounded-xl w-full">
          <div className="text-xs text-gray-400 mb-2">You Receive</div>
          <div className="flex gap-2">
            <input
              type="number"
              value={tradeType === "buy" ? amount : suiAmount}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white text-lg font-semibold outline-none"
              readOnly
            />
            <div className="bg-[#27272a] px-3 py-2 rounded-lg text-sm font-semibold">
              {tradeType === "buy" ? coinDetails?.symbol || "TOKEN" : "SUI"}
            </div>
          </div>
        </div>

        <div className="w-full p-3 bg-[#151515] rounded-xl">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Price</span>
            <span>{tokenPrice} SUI</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Fee ({tradingFee}%)</span>
            <span>{feeAmount} SUI</span>
          </div>
        </div>

        {status && (
          <div className={`w-full p-2 rounded-lg text-xs text-center ${status.includes("Error") ? "bg-red-600" : "bg-green-600"}`}>
            {status}
          </div>
        )}

        <PrimaryButton
          name={loading ? "Processing..." : tradeType === "buy" ? "Buy Tokens" : "Sell Tokens"}
          handleOnClick={handleTrade}
          disabled={loading}
          className="w-full py-3"
        />
      </div>
    </div>
  );
};

export default Swap;
