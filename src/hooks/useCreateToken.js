// useCreateToken.js — Real Moonbags token creation
// ============================================================
// Uses create_and_lock_first_buy_with_fee — ONE transaction that:
//   1. Mints all tokens from treasury cap
//   2. Creates bonding curve pool
//   3. Optionally executes first buy
//   4. Sets up staking pools
//   5. Collects 0.01 SUI creation fee
//
// Requires: TreasuryCap + CoinMetadata (user publishes coin module first)
// ============================================================

import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import axios from 'axios';
import {
  MOONBAGS_PACKAGE,
  MOONBAGS_CONFIG,
  MOONBAGS_STAKE_CONFIG,
  MOONBAGS_LOCK_CONFIG,
  CETUS_BURN_MANAGER,
  CETUS_POOLS,
  CETUS_GLOBAL_CONFIG,
  SUI_CLOCK,
  POOL_CREATION_FEE_MIST,
  DEX,
  BACKEND_URL,
  SUI_RPC,
} from '../constants/contracts';
import { SuiClient } from '@mysten/sui/client';

const suiClient = new SuiClient({ url: SUI_RPC });

// ── Pre-compiled coin module bytecode ────────────────────────
// Compiled with: sui move build --dump-bytecode-as-base64
// Module: coin_template::coin_template, OTW: COIN_TEMPLATE
// sui 1.68.0, verified magic 0xa11ceb0b
const COIN_MODULE_BASE64 = 'oRzrCwYAAAAKAQAMAgweAyoiBEwIBVRUB6gBwAEI6AJgBsgDFArcAwUM4QMoAAcBDAIGAhACEQISAAACAAECBwEAAAIBDAEAAQIDDAEAAQQEAgAFBQcAAAoAAQABCwEEAQACCAYHAQIDDQkBAQwDDg0BAQwEDwoLAAEDAgUDCAQMAggABwgEAAILAgEIAAsDAQgAAQgFAQsBAQkAAQgABwkAAgoCCgIKAgsBAQgFBwgEAgsDAQkACwIBCQABCwIBCAABCQABBggEAQUBCwMBCAACCQAFDUNPSU5fVEVNUExBVEUMQ29pbk1ldGFkYXRhBk9wdGlvbgtUcmVhc3VyeUNhcAlUeENvbnRleHQDVXJsBGNvaW4NY29pbl90ZW1wbGF0ZQ9jcmVhdGVfY3VycmVuY3kLZHVtbXlfZmllbGQEaW5pdARub25lBm9wdGlvbhRwdWJsaWNfZnJlZXplX29iamVjdA9wdWJsaWNfdHJhbnNmZXIGc2VuZGVyCHRyYW5zZmVyCnR4X2NvbnRleHQDdXJsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCgIFBENPSU4KAgUEQ29pbgoCAQAAAgEJAQAAAAACEgsAMQkHAAcBBwI4AAoBOAEMAgwDCwI4AgsDCwEuEQU4AwIA';

export function useCreateToken() {
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const createToken = async ({
    wallet,
    name,
    symbol,
    description   = '',
    imageUrl      = '',   // uri
    twitter       = '',
    telegram      = '',
    website       = '',
    bondingDex    = DEX.CETUS,   // 0=Cetus, 1=Turbos
    initialSuiForBuy = 0,        // SUI to spend on first buy (0 = no first buy)
    tokenAmountOut   = 0,        // tokens to buy in first buy (0 = no first buy)
    lockingTimeMs    = 0,        // 0 = no lock (or minimum 3_600_000 = 1 hour)
    threshold        = null,     // null = default 3 SUI
  }) => {
    if (!wallet?.connected) throw new Error('Wallet not connected');
    if (!name || !symbol)   throw new Error('name and symbol required');

    setLoading(true);
    setResult(null);

    try {
      // ── TX 1: Publish coin module ─────────────────────────
      setStatus('Step 1/2: Publishing coin module...');

      const moduleBytes = Uint8Array.from(atob(COIN_MODULE_BASE64), c => c.charCodeAt(0));
      const tx1 = new Transaction();
      const [upgradeCap] = tx1.publish({
        modules: [Array.from(moduleBytes)],
        dependencies: [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000000000000000000000000000002',
        ],
      });
      tx1.transferObjects([upgradeCap], tx1.pure.address(wallet.address));

      setStatus('Waiting for wallet approval (1/2)...');
      const publishResult = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx1,
        options: { showEffects: true, showObjectChanges: true },
      });

      if (publishResult?.effects?.status?.status !== 'success') {
        throw new Error(`Publish failed: ${publishResult?.effects?.status?.error}`);
      }

      // Extract package ID, TreasuryCap, and CoinMetadata from result
      const changes = publishResult.objectChanges || [];
      const publishedPkg = changes.find(c => c.type === 'published');
      if (!publishedPkg?.packageId) throw new Error('Could not find published package ID');

      const packageId   = publishedPkg.packageId;
      const tokenType   = `${packageId}::coin_template::COIN_TEMPLATE`;

      // TreasuryCap and CoinMetadata are created by the coin module's init()
      // They appear in objectChanges
      const treasuryCapObj = changes.find(c =>
        c.type === 'created' && c.objectType?.includes('TreasuryCap')
      );
      const metadataObj = changes.find(c =>
        c.type === 'created' && c.objectType?.includes('CoinMetadata')
      );

      if (!treasuryCapObj?.objectId) throw new Error('TreasuryCap not found in publish result');
      if (!metadataObj?.objectId)    throw new Error('CoinMetadata not found in publish result');

      // ── TX 2: create_and_lock_first_buy_with_fee ─────────
      setStatus('Step 2/2: Creating bonding curve pool...');

      const tx2 = new Transaction();

      // Creation fee: 0.01 SUI
      const [creationFee] = tx2.splitCoins(tx2.gas, [tx2.pure.u64(POOL_CREATION_FEE_MIST)]);

      // Optional first buy SUI coin
      let firstBuyCoin;
      if (initialSuiForBuy > 0) {
        const buyMist = BigInt(Math.floor(initialSuiForBuy * 1e9));
        [firstBuyCoin] = tx2.splitCoins(tx2.gas, [tx2.pure.u64(buyMist)]);
      } else {
        firstBuyCoin = tx2.moveCall({
          target: '0x2::coin::zero',
          typeArguments: ['0x2::sui::SUI'],
          arguments: [],
        });
      }

      // Threshold: none = use default 3 SUI
      const thresholdArg = threshold
        ? tx2.pure.option('u64', BigInt(threshold))
        : tx2.pure.option('u64', null);

      // create_and_lock_first_buy_with_fee<Token>(
      //   configuration, stake_config, token_lock_config,
      //   treasury_cap, pool_creation_fee, bonding_dex,
      //   coin_sui, amount_out, threshold, locking_time_ms, clock,
      //   name, symbol, uri, description, twitter, telegram, website,
      //   cetus_burn_manager, cetus_pools, cetus_global_config,
      //   metadata_sui, metadata_token, ctx)

      // Get SUI metadata object ID (needed for Cetus pool setup)
      const suiMetadata = await suiClient.getCoinMetadata({ coinType: '0x2::sui::SUI' });
      const suiMetadataId = suiMetadata?.id;
      if (!suiMetadataId) throw new Error('Could not fetch SUI CoinMetadata object ID');

      tx2.moveCall({
        target: `${MOONBAGS_PACKAGE}::moonbags::create_and_lock_first_buy_with_fee`,
        typeArguments: [tokenType],
        arguments: [
          tx2.object(MOONBAGS_CONFIG),
          tx2.object(MOONBAGS_STAKE_CONFIG),
          tx2.object(MOONBAGS_LOCK_CONFIG),
          tx2.object(treasuryCapObj.objectId),
          creationFee,
          tx2.pure.u8(bondingDex),
          firstBuyCoin,
          tx2.pure.u64(tokenAmountOut),
          thresholdArg,
          tx2.pure.u64(lockingTimeMs),
          tx2.object(SUI_CLOCK),
          tx2.pure.string(name),
          tx2.pure.string(symbol.toUpperCase()),
          tx2.pure.string(imageUrl),
          tx2.pure.string(description),
          tx2.pure.string(twitter),
          tx2.pure.string(telegram),
          tx2.pure.string(website),
          tx2.object(CETUS_BURN_MANAGER),
          tx2.object(CETUS_POOLS),
          tx2.object(CETUS_GLOBAL_CONFIG),
          tx2.object(suiMetadataId),
          tx2.object(metadataObj.objectId),
        ],
      });

      setStatus('Waiting for wallet approval (2/2)...');
      const createResult = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx2,
        options: { showEffects: true, showObjectChanges: true, showEvents: true },
      });

      if (createResult?.effects?.status?.status !== 'success') {
        throw new Error(`Pool creation failed: ${createResult?.effects?.status?.error}`);
      }

      // Extract pool ID from CreatedEventV2
      const createdEvent = createResult.events?.find(e => e.type?.includes('CreatedEventV2'));
      const poolId = createdEvent?.parsedJson?.pool_id;

      // Register with backend
      try {
        await axios.post(`${BACKEND_URL}/memecoins/create`, {
          name, ticker: symbol.toUpperCase(), desc: description,
          creator: wallet.address, image: imageUrl,
          xSocial: twitter, telegramSocial: telegram, websiteUrl: website,
          coinAddress: tokenType,
        });
        if (poolId) {
          await axios.post(`${BACKEND_URL}/tokens/confirm`, {
            poolId, tokenType, creator: wallet.address,
            transactionDigest: createResult.digest,
          });
        }
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
