// useTrade.js — Moonbags buy/sell hook
// ============================================================
// Uses moonbags::buy and moonbags::sell.
// buy/sell are entry functions so NO transferObjects needed.
// ============================================================

import { useCallback } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import {
  MOONBAGS_PACKAGE,
  MOONBAGS_CONFIG,
  SUI_CLOCK,
  SUI_RPC,
  DEFAULT_SLIPPAGE_BPS,
} from '../constants/contracts';

const suiClient = new SuiClient({ url: SUI_RPC });
const BPS = 10000n;

// ── BUY ───────────────────────────────────────────────────────
// moonbags::buy<Token>(config, clock, payment, min_out, ctx)
// payment = SUI coin, min_out = minimum tokens (slippage guard)
// Pool is a dynamic field on config keyed by token type address.
// ─────────────────────────────────────────────────────────────
export function useBuy() {
  return useCallback(async ({
    wallet,
    tokenType,     // e.g. "0xabc::coin::COIN"
    suiAmount,     // number in SUI (e.g. 1.5)
    minTokensOut = 0,  // set via slippage calculation
    slippageBps = DEFAULT_SLIPPAGE_BPS,
  }) => {
    if (!wallet?.connected) throw new Error('Wallet not connected');
    if (!tokenType)         throw new Error('tokenType required');

    const amtMist = BigInt(Math.floor(suiAmount * 1e9));
    if (amtMist <= 0n) throw new Error('Amount must be > 0');

    const tx = new Transaction();

    const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(amtMist)]);

    // moonbags::buy is an entry fun — tokens transferred inside the contract
    tx.moveCall({
      target: `${MOONBAGS_PACKAGE}::moonbags::buy`,
      typeArguments: [tokenType],
      arguments: [
        tx.object(MOONBAGS_CONFIG),
        tx.object(SUI_CLOCK),
        payment,
        tx.pure.u64(minTokensOut),
      ],
    });

    return wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: { showEffects: true, showEvents: true },
    });
  }, []);
}

// ── SELL ──────────────────────────────────────────────────────
// moonbags::sell<Token>(config, clock, tokens_in, min_sui_out, ctx)
// tokens_in = Token coin from user's wallet
// SUI is transferred back to sender inside the contract.
// ─────────────────────────────────────────────────────────────
export function useSell() {
  return useCallback(async ({
    wallet,
    tokenType,      // e.g. "0xabc::coin::COIN"
    tokenAmount,    // number of tokens (integer, no decimals conversion)
    minSuiOut = 0,
  }) => {
    if (!wallet?.connected) throw new Error('Wallet not connected');
    if (!tokenType)         throw new Error('tokenType required');

    // Fetch user's token coin objects
    const coinsResp = await suiClient.getCoins({
      owner:    wallet.address,
      coinType: tokenType,
    });

    if (!coinsResp.data?.length) {
      throw new Error(`No ${tokenType.split('::').pop()} tokens found in wallet`);
    }

    const tokenMist = BigInt(Math.floor(tokenAmount));
    const tx = new Transaction();

    // Merge + split to exact amount if needed
    let tokenCoin;
    if (coinsResp.data.length === 1) {
      tokenCoin = tx.object(coinsResp.data[0].coinObjectId);
    } else {
      const primary = tx.object(coinsResp.data[0].coinObjectId);
      const rest    = coinsResp.data.slice(1).map(c => tx.object(c.coinObjectId));
      tx.mergeCoins(primary, rest);
      const [split] = tx.splitCoins(primary, [tx.pure.u64(tokenMist)]);
      tokenCoin = split;
    }

    // moonbags::sell is entry — SUI transferred inside contract
    tx.moveCall({
      target: `${MOONBAGS_PACKAGE}::moonbags::sell`,
      typeArguments: [tokenType],
      arguments: [
        tx.object(MOONBAGS_CONFIG),
        tx.object(SUI_CLOCK),
        tokenCoin,
        tx.pure.u64(minSuiOut),
      ],
    });

    return wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: { showEffects: true, showEvents: true },
    });
  }, []);
}

// ── Combined hook for Swap component ─────────────────────────
export function useTrade() {
  const buy  = useBuy();
  const sell = useSell();
  return { buy, sell };
}

export default useTrade;
