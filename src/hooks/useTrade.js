import { useCallback } from 'react';
import { Transaction } from '@mysten/sui/transactions';

const CONFIG = {
  PACKAGE_ID: '0x50e60400cc2ea760b5fb8380fa3f1fc0a94dfc592ec78487313d21b50af846da',
  CONFIG_ID: '0x202f7e8fe6c22cd4e34f969c435e90f677ae40447be04b653aa880d9e1c37754',
};

export const useTrade = () => {
  
  const buyTokens = useCallback(async (wallet, tokenAddress, suiAmount) => {
    if (!wallet.connected) {
      throw new Error('Wallet not connected');
    }

    const tx = new Transaction();
    
    // Convert SUI to MIST (1 SUI = 10^9 MIST)
    const amountMIST = BigInt(Math.floor(suiAmount * 1e9));
    
    // Split gas coin for payment
    const [paymentCoin] = tx.splitCoins(tx.gas(), [tx.pure(amountMIST)]);
    
    // Call the moonbags::buy function
    // Arguments: token, payment
    tx.moveCall({
      target: `${CONFIG.PACKAGE_ID}::moonbags::buy`,
      arguments: [
        tx.object(tokenAddress),
        paymentCoin,
      ],
    });

    const result = await wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });

    return result;
  }, []);

  const sellTokens = useCallback(async (wallet, tokenAddress, tokenAmount) => {
    if (!wallet.connected) {
      throw new Error('Wallet not connected');
    }

    const tx = new Transaction();
    
    // Call moonbags::sell function
    tx.moveCall({
      target: `${CONFIG.PACKAGE_ID}::moonbags::sell`,
      arguments: [
        tx.object(tokenAddress),
        tx.pure(tokenAmount),
      ],
    });

    const result = await wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
    });

    return result;
  }, []);

  return {
    buyTokens,
    sellTokens,
    config: CONFIG,
  };
};

export default useTrade;
