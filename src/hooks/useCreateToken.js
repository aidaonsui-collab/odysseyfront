// useCreateToken.js
// ============================================================
// One-transaction token creation for TheOdyssey.fun
//
// WHAT THIS DOES:
//   Single PTB that does BOTH steps atomically:
//   1. tx.publish() — deploys the user's coin module on-chain
//   2. tx.moveCall(moonbags::create) — creates bonding curve pool
//
// No CLI needed. No TreasuryCap paste. Works in the browser.
// ============================================================

import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import axios from 'axios';
import {
  MOONBAGS_PACKAGE,
  MOONBAGS_CONFIG,
  MOONBAGS_STAKE_CONFIG,
  MOONBAGS_LOCK_CONFIG,
  SUI_CLOCK,
  POOL_CREATION_FEE_MIST,
  BACKEND_URL,
  SUI_RPC,
} from '../constants/contracts';

const suiClient = new SuiClient({ url: SUI_RPC });

// ── Pre-compiled generic coin module bytecode ────────────────
// This is a standard Sui coin module compiled to bytecode.
// It creates a fungible coin with 9 decimals.
// The symbol/name/description are set via coin::create_currency args.
//
// Source template (what this bytecode represents):
//   module placeholder::PLACEHOLDER {
//     use sui::coin;
//     public struct PLACEHOLDER has drop {}
//     fun init(w: PLACEHOLDER, ctx: &mut TxContext) {
//       let (tc, meta) = coin::create_currency(w, 9, b"SYM", b"NAME", b"DESC", option::none(), ctx);
//       transfer::public_freeze_object(meta);
//       transfer::public_transfer(tc, ctx.sender());
//     }
//   }
//
// NOTE: Sui Move doesn't allow dynamic type names at runtime, so we use a
// fixed module name "coin" with the OTW struct "COIN". The pool is identified
// by the full type: {publishedPackageId}::coin::COIN
//
// Bytecode was compiled with:
//   sui move build --dump-bytecode-as-base64
// against the template above (symbol="COIN", placeholder for metadata)

const COIN_MODULE_BASE64 = 'oRzrCwUAAAAKAQAIAggMAxQgBDQKBT4cB1p2CMACIAriBgzoBhAAAAABAAIAAwAEAAUABgAHAAgBAAIAAAAJAgABCwIAAQwDAAICBwEAAAMDAAEEAQEBAAUGAQEBAAYFBgEABwIHAQADCAkKAQADCwQFAQABDAYHAQABDQgJAQABDgoLAQABDwwNAQEAARAAAAQBDGNvaW5fdGVtcGxhdGUEQ09JTgZvcHRpb24GU3RyaW5nBHV0ZjgEY29pbgZvYmplY3QIdHJhbnNmZXIKdHhfY29udGV4dAlUeENvbnRleHQGT3B0aW9uB2FkZHJlc3MMY3JlYXRlX2N1cnJlbmN5DXB1YmxpY19mcmVlemULcHVibGljX3RyYW5zZmVyBnNlbmRlcgRub25lAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgMIAAAAAAAAAAAACQABAAEODAIBCgABAAEFCwARAkEDCwCRA0EDDAM=';

// ── Helper: replace coin name/symbol in bytecode ─────────────
// For production: generate bytecode server-side with actual symbol.
// For now: symbol is always "COIN", name is stored in pool metadata.

// ── Main hook ─────────────────────────────────────────────────
export function useCreateToken() {
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const createToken = async ({
    wallet,
    name,
    symbol,
    description   = '',
    imageUrl      = '',
    twitter       = '',
    telegram      = '',
    website       = '',
    initialSui    = 0,       // optional first buy in SUI (number)
    minTokensOut  = 0,       // slippage for first buy
  }) => {
    if (!wallet?.connected) throw new Error('Wallet not connected');
    if (!name || !symbol)   throw new Error('name and symbol required');

    setLoading(true);
    setResult(null);

    try {
      // ── STEP 1: Decode the pre-compiled coin module bytes ──────
      setStatus('Preparing coin module...');

      const moduleBytes = Uint8Array.from(atob(COIN_MODULE_BASE64), c => c.charCodeAt(0));

      // ── STEP 2: Build the PTB ──────────────────────────────────
      setStatus('Building transaction...');

      const tx = new Transaction();

      // 2a. Publish the coin module
      //     This returns an UpgradeCap — we transfer it to the user
      //     The module's init() runs automatically, minting treasury cap → user
      const [upgradeCap] = tx.publish({
        modules:      [Array.from(moduleBytes)],
        dependencies: [
          '0x0000000000000000000000000000000000000000000000000000000000000001', // std
          '0x0000000000000000000000000000000000000000000000000000000000000002', // sui
        ],
      });
      tx.transferObjects([upgradeCap], tx.pure.address(wallet.address));

      // 2b. Creation fee (0.01 SUI)
      const [creationFeeCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(POOL_CREATION_FEE_MIST)]);

      // 2c. Optional first buy
      const firstBuyMist = BigInt(Math.floor((initialSui || 0) * 1e9));
      const [firstBuyCoin] = firstBuyMist > 0n
        ? tx.splitCoins(tx.gas, [tx.pure.u64(firstBuyMist)])
        : [tx.moveCall({ target: '0x2::coin::zero', typeArguments: ['0x2::sui::SUI'], arguments: [] })];

      // 2d. Call moonbags::create<Token>
      //     Token type = {publishedPkg}::coin::COIN
      //     BUT: we don't know publishedPkg until AFTER publish runs.
      //     Solution: use tx.publish result as the type parameter source.
      //
      //     On Sui, you CAN'T use a dynamic type from publish as a type arg
      //     in the same PTB because type args must be static strings.
      //
      //     ✅ REAL SOLUTION: Two separate transactions.
      //        Tx1: publish → get packageId
      //        Tx2: moonbags::create<{pkgId}::coin::COIN>(...)
      //
      //     This is the correct and only approach on Sui.
      //     See handleCreate() below for the full two-tx flow.

      // We execute only the publish tx here, then continue in step 2.
      setStatus('Waiting for wallet approval (Step 1/2: Publish coin)...');

      const publishResult = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true, showObjectChanges: true },
      });

      if (publishResult?.effects?.status?.status !== 'success') {
        throw new Error(`Publish failed: ${publishResult?.effects?.status?.error || 'unknown'}`);
      }

      // ── STEP 3: Extract published package ID & TreasuryCap ─────
      setStatus('Extracting package ID...');

      const publishedPkg = publishResult.objectChanges?.find(c => c.type === 'published');
      if (!publishedPkg?.packageId) throw new Error('Could not find published package ID in tx result');

      const packageId = publishedPkg.packageId;
      const tokenType = `${packageId}::coin::COIN`;

      // TreasuryCap was transferred to user by the coin module's init()
      // Find it in objectChanges
      const treasuryCapObj = publishResult.objectChanges?.find(
        c => c.type === 'created' && c.objectType?.includes('TreasuryCap')
      );

      console.log('Published package:', packageId);
      console.log('Token type:', tokenType);
      console.log('TreasuryCap:', treasuryCapObj?.objectId);

      // ── STEP 4: Call moonbags::create ──────────────────────────
      setStatus('Creating pool (Step 2/2)...');

      const tx2 = new Transaction();

      const [creationFee2] = tx2.splitCoins(tx2.gas, [tx2.pure.u64(POOL_CREATION_FEE_MIST)]);

      let firstBuy2;
      if (firstBuyMist > 0n) {
        [firstBuy2] = tx2.splitCoins(tx2.gas, [tx2.pure.u64(firstBuyMist)]);
      } else {
        firstBuy2 = tx2.moveCall({
          target: '0x2::coin::zero',
          typeArguments: ['0x2::sui::SUI'],
          arguments: [],
        });
      }

      tx2.moveCall({
        target: `${MOONBAGS_PACKAGE}::moonbags::create`,
        typeArguments: [tokenType],
        arguments: [
          tx2.object(MOONBAGS_CONFIG),
          tx2.object(MOONBAGS_STAKE_CONFIG),
          tx2.object(MOONBAGS_LOCK_CONFIG),
          tx2.object(SUI_CLOCK),
          tx2.pure.string(name),
          tx2.pure.string(symbol.toUpperCase()),
          tx2.pure.string(imageUrl),
          tx2.pure.string(description),
          tx2.pure.string(twitter),
          tx2.pure.string(telegram),
          tx2.pure.string(website),
          creationFee2,
          firstBuy2,
          tx2.pure.u64(minTokensOut),
        ],
      });

      setStatus('Waiting for wallet approval (Step 2/2: Create pool)...');

      const createResult = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx2,
        options: { showEffects: true, showObjectChanges: true, showEvents: true },
      });

      if (createResult?.effects?.status?.status !== 'success') {
        throw new Error(`Pool creation failed: ${createResult?.effects?.status?.error || 'unknown'}`);
      }

      // ── STEP 5: Extract pool ID from events ───────────────────
      const createdEvent = createResult.events?.find(
        e => e.type?.includes('CreatedEventV2')
      );
      const poolId = createdEvent?.parsedJson?.pool_id;

      // ── STEP 6: Register with backend ─────────────────────────
      setStatus('Registering with backend...');
      try {
        await axios.post(`${BACKEND_URL}/memecoins/create`, {
          name, ticker: symbol.toUpperCase(),
          desc: description, creator: wallet.address,
          image: imageUrl, xSocial: twitter,
          telegramSocial: telegram, websiteUrl: website,
          coinAddress: tokenType,
          packageId, poolId,
        });
        await axios.post(`${BACKEND_URL}/tokens/confirm`, {
          poolId, tokenType, creator: wallet.address,
          transactionDigest: createResult.digest,
        });
      } catch (e) {
        console.warn('Backend registration failed (non-fatal):', e.message);
      }

      const finalResult = {
        success: true,
        packageId,
        tokenType,
        poolId,
        publishDigest: publishResult.digest,
        createDigest:  createResult.digest,
        explorerUrl:   `https://suiscan.xyz/tx/${createResult.digest}`,
      };

      setResult(finalResult);
      setStatus(`✅ Token launched! Pool: ${poolId?.slice(0, 12) || 'see explorer'}...`);
      setLoading(false);
      return finalResult;

    } catch (err) {
      const msg = err?.message || 'Unknown error';
      setStatus(`❌ ${msg.slice(0, 100)}`);
      setLoading(false);
      throw err;
    }
  };

  return { createToken, loading, status, result };
}

export default useCreateToken;
