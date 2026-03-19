// useTrade.js — Real Moonbags buy/sell
// ============================================================
// CRITICAL: buy() takes amount_out (tokens desired), NOT SUI amount.
// The contract calculates required SUI internally and returns excess.
// sell() takes tokens_in and min SUI out.
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
  TRADING_FEE_BPS,
} from '../constants/contracts';

const suiClient = new SuiClient({ url: SUI_RPC });

// ── Estimate SUI cost for buying `tokenAmountOut` tokens ────
// Uses the bonding curve: cost = virtual_sui * amount_out / (virtual_token - amount_out)
// Plus platform fee
export function estimateBuyCost(virtualSui, virtualToken, tokenAmountOut, feeBps = TRADING_FEE_BPS) {
  if (!tokenAmountOut || tokenAmountOut <= 0 || tokenAmountOut >= virtualToken) return 0;
  const cost = Math.floor((virtualSui * tokenAmountOut) / (virtualToken - tokenAmountOut));
  const fee  = Math.floor((cost * feeBps) / 10000);
  return cost + fee + 1; // +1 for rounding
}

// ── Estimate tokens out for selling `tokenAmountIn` tokens ──
export function estimateSellReturn(virtualSui, virtualToken, tokenAmountIn, feeBps = TRADING_FEE_BPS) {
  if (!tokenAmountIn || tokenAmountIn <= 0) return 0;
  const suiOut  = Math.floor((virtualSui * tokenAmountIn) / (virtualToken + tokenAmountIn));
  const fee     = Math.floor((suiOut * feeBps) / 10000);
  return suiOut - fee;
}

// ── BUY ───────────────────────────────────────────────────────
// buy<Token>(configuration, coin_sui, amount_out, ctx)
//   coin_sui: Coin<SUI> — must cover cost + fee (excess returned automatically)
//   amount_out: u64     — number of TOKENS you want to receive
//
// Frontend flow:
//   1. User enters SUI amount → estimate tokens out via estimateBuyCost
//   2. Or user enters token amount → calculate required SUI via cost formula
//   3. Split SUI from gas, call buy with token amount desired
// ─────────────────────────────────────────────────────────────
export function useBuy() {
  return useCallback(async ({
    wallet,
    tokenType,        // e.g. "0xabc::mytoken::MYTOKEN"
    suiAmountMist,    // BigInt — SUI to send (covers cost + fee + buffer)
    tokenAmountOut,   // number — tokens you expect to receive
    slippageBps = DEFAULT_SLIPPAGE_BPS,
  }) => {
    if (!wallet?.connected) throw new Error('Wallet not connected');
    if (!tokenType)         throw new Error('tokenType required');

    const tx = new Transaction();

    // Split exact SUI from gas
    const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmountMist)]);

    // Apply slippage to amount_out: accept at least (1 - slippage)% of expected tokens
    const minTokens = Math.floor(tokenAmountOut * (10000 - slippageBps) / 10000);

    // buy<Token>(configuration, coin_sui, amount_out, ctx)
    // amount_out is the MIN tokens you're willing to accept
    tx.moveCall({
      target: `${MOONBAGS_PACKAGE}::moonbags::buy`,
      typeArguments: [tokenType],
      arguments: [
        tx.object(MOONBAGS_CONFIG),
        suiCoin,
        tx.pure.u64(minTokens),
      ],
    });

    return wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: { showEffects: true, showEvents: true },
    });
  }, []);
}

// ── SELL ──────────────────────────────────────────────────────
// sell<Token>(configuration, coin_token, amount_out_min, clock, ctx)
//   coin_token: Coin<Token> — tokens to sell
//   amount_out_min: u64     — minimum SUI to receive (slippage guard)
// ─────────────────────────────────────────────────────────────
export function useSell() {
  return useCallback(async ({
    wallet,
    tokenType,
    tokenAmount,      // number of tokens to sell
    minSuiOutMist,    // BigInt — minimum SUI to receive
    slippageBps = DEFAULT_SLIPPAGE_BPS,
  }) => {
    if (!wallet?.connected) throw new Error('Wallet not connected');
    if (!tokenType)         throw new Error('tokenType required');

    // Fetch user's token coins
    const coinsResp = await suiClient.getCoins({ owner: wallet.address, coinType: tokenType });
    if (!coinsResp.data?.length) throw new Error(`No ${tokenType.split('::').pop()} tokens in wallet`);

    const sellAmt = BigInt(Math.floor(tokenAmount));
    const tx = new Transaction();

    // Merge + split token coins to exact sell amount
    let tokenCoin;
    if (coinsResp.data.length === 1) {
      tokenCoin = tx.object(coinsResp.data[0].coinObjectId);
    } else {
      const primary = tx.object(coinsResp.data[0].coinObjectId);
      const rest    = coinsResp.data.slice(1).map(c => tx.object(c.coinObjectId));
      tx.mergeCoins(primary, rest);
      const [split] = tx.splitCoins(primary, [tx.pure.u64(sellAmt)]);
      tokenCoin = split;
    }

    const minOut = minSuiOutMist !== undefined
      ? minSuiOutMist
      : 0n;

    // sell<Token>(configuration, coin_token, amount_out_min, clock, ctx)
    tx.moveCall({
      target: `${MOONBAGS_PACKAGE}::moonbags::sell`,
      typeArguments: [tokenType],
      arguments: [
        tx.object(MOONBAGS_CONFIG),
        tokenCoin,
        tx.pure.u64(minOut),
        tx.object(SUI_CLOCK),
      ],
    });

    return wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: { showEffects: true, showEvents: true },
    });
  }, []);
}

// ── Combined hook ─────────────────────────────────────────────
export function useTrade() {
  const buy  = useBuy();
  const sell = useSell();
  return { buy, sell, estimateBuyCost, estimateSellReturn };
}

export default useTrade;
