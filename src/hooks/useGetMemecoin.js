import { useQuery } from "@tanstack/react-query";

// Contract addresses
const PACKAGE_ID = '0x50e60400cc2ea760b5fb8380fa3f1fc0a94dfc592ec78487313d21b50af846da';
const CONFIG_ID = '0x202f7e8fe6c22cd4e34f969c435e90f677ae40447be04b653aa880d9e1c37754';
const SUI_RPC = 'https://fullnode.mainnet.sui.io';

const rpcRequest = async (method, params) => {
  const response = await fetch(SUI_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  });
  const data = await response.json();
  return data.result;
};

const useGetMemecoin = (id) => {
  return useQuery({
    queryKey: ["memecoin", id], 
    queryFn: async () => {
      if (!id) return null;
      
      try {
        // Try to get pool data from contract
        const poolData = await rpcRequest('suix_getDynamicFieldObject', {
          parentId: CONFIG_ID,
          name: { type: 'address', value: id.replace('0x', '') }
        });
        
        if (poolData?.data?.content?.dataType === 'moveObject') {
          const fields = poolData.data.content.fields;
          const virtualSuiReserves = parseInt(fields.virtual_sui_reserves || 0);
          const virtualTokenReserves = parseInt(fields.virtual_token_reserves || 0);
          const realSuiReserves = parseInt(fields.real_sui_reserves || 0);
          const realTokenReserves = parseInt(fields.real_token_reserves || 0);
          
          // Calculate market cap and progress
          const totalSupply = virtualTokenReserves + realTokenReserves;
          const marketCapSui = virtualSuiReserves > 0 ? (virtualSuiReserves / 1e9).toFixed(2) : 0;
          const progress = totalSupply > 0 ? Math.min(100, ((totalSupply - realTokenReserves) / totalSupply) * 100).toFixed(1) : 0;
          
          return {
            name: "TEST",
            symbol: "$TEST",
            desc: "Test token on Sui",
            image: "/assets/coin-img/coin_img_1.jpeg",
            ca: id,
            marketCap: marketCapSui,
            liquidity: (realSuiReserves / 1e9).toFixed(2),
            volume24h: 0, // Would need tx history for this
            curveProgress: progress,
            holders: 1,
          };
        }
      } catch (e) {
        console.error("RPC error:", e);
      }
      
      // Fallback: return data with contract address
      return {
        name: "TEST",
        symbol: "$TEST", 
        desc: "Test token on Sui",
        image: "/assets/coin-img/coin_img_1.jpeg",
        ca: id,
        marketCap: 0,
        liquidity: 0,
        volume24h: 0,
        curveProgress: 0,
        holders: 0,
      };
    },
    enabled: !!id,
    refetchInterval: 30000, // Refresh every 30s
  });
};

export default useGetMemecoin;
