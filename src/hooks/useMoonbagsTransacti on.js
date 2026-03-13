// Moonbags Transaction Builder
// For creating tokens via create_and_lock_first_buy_with_fee

export const MOONBAGS_CONFIG = {
  packageId: '0xffbc1d872f92494c41eb6483033a647d51c59c3f813070ea2ecf6023881376f4',
  configId: '0x202f7e8fe6c22cd4e34f969c435e90f677ae40447be04b653aa880d9e1c37754',
  // These need to be fetched from chain
  burnManagerId: null,   // TODO: Find on chain
  poolsId: null,        // TODO: Find on chain  
  globalConfigId: null, // TODO: Find on chain
  clockId: '0x6',
  suiMetadataId: '0x1', // SUI coin metadata
};

// Known addresses from the contract
export const CETUS_BURN_MANAGER = '0xc818dac4c8a1a7b3e72b36bbf9c3d8acafe8d9298e4a45f96be3ad9b00e1a9a';
export const CETUS_POOLS = '0xc8d3b0d3d7a1c5f4b1b0e5d8c3a2f4e9d1b0c5a8f3e2d1c0b9a8f7e6d5c4b3a2';

export async function buildCreateTokenTransaction({ wallet, params }) {
  const { 
    name,
    symbol, 
    description, 
    uri, // image URL
    twitter,
    telegram, 
    website,
    initialSuiAmount, // in SUI (will be converted to MIST)
    initialVirtualTokenReserves,
    lockDurationMs, // optional lock duration
    migrationDex, // 0 = Cetus, 1 = Turbos
  } = params;

  const tx = new Transaction();
  
  // 1. Create the coin (one-time witness)
  const [treasuryCap, metadata] = tx.moveCall({
    target: '0x2::coin::create_currency',
    arguments: [
      tx.object.get('0x2'), // TxContext
    ],
    typeArguments: [`${wallet.address}::${symbol.toLowerCase()}::${symbol.toUpperCase()}`],
  });

  // 2. Split initial SUI for liquidity
  const initialSui = tx.splitCoins(tx.gas, [tx.pure.u64(initialSuiAmount * 1e9)]);

  // 3. Call create_and_lock_first_buy_with_fee
  tx.moveCall({
    target: `${MOONBAGS_CONFIG.packageId}::moonbags::create_and_lock_first_buy_with_fee`,
    arguments: [
      tx.object(MOONBAGS_CONFIG.configId),     // config
      tx.object(MOONBAGS_CONFIG.configId),     // stake config (same)
      tx.object('0x0'),                         // threshold config (needs to be created/found)
      treasuryCap,                              // treasury_cap
      tx.pure.u8(migrationDex || 0),            // migration_dex (0=Cetus)
      initialSui,                              // coin_sui
      tx.pure.u64(initialVirtualTokenReserves || 1000000000), // initial_virtual_token_reserves
      tx.pure.option(lockDurationMs),           // lock_duration (Option<u64>)
      tx.pure.u64(0),                          // threshold
      tx.object(MOONBAGS_CONFIG.clockId),      // clock
      tx.pure.string(name),
      tx.pure.string(symbol.toUpperCase()),
      tx.pure.string(uri || ''),
      tx.pure.string(description),
      tx.pure.string(twitter || ''),
      tx.pure.string(telegram || ''),
      tx.pure.string(website || ''),
      tx.object('TODO_BURN_MANAGER'),           // burn_manager
      tx.object('TODO_POOLS'),                  // pools
      tx.object('TODO_GLOBAL_CONFIG'),          // global_config
      tx.object(MOONBAGS_CONFIG.suiMetadataId), // sui_metadata
      metadata,                                 // token_metadata
      tx.object.get('0x2'),                    // TxContext
    ],
    typeArguments: [`${wallet.address}::${symbol.toLowerCase()}::${symbol.toUpperCase()}`],
  });

  return tx;
}

// Alternative: Simple buy transaction (after token exists)
export async function buildBuyTransaction({ wallet, params }) {
  const { 
    tokenType,
    amountOut, // amount of tokens to buy
  } = params;

  const tx = new Transaction();

  // Split SUI for purchase
  const suiCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amountOut)]);

  tx.moveCall({
    target: `${MOONBAGS_CONFIG.packageId}::moonbags::buy`,
    arguments: [
      tx.object(MOONBAGS_CONFIG.configId),
      suiCoin,
      tx.pure.u64(amountOut),
      tx.object.get('0x2'), // TxContext
    ],
    typeArguments: [tokenType],
  });

  return tx;
}

// Fetch required objects from chain
export async function fetchChainObjects() {
  // These need to be queried from the publisher address
  const publisher = '0x2957f0f19ee92eb5283bf1aa6ce7a3742ea7bc79bc9d1dc907fbbf7a11567409';
  
  // TODO: Query suix_getOwnedObjects for:
  // - BurnManager
  // - Pools (Cetus or Turbos)
  // - GlobalConfig
  
  return {
    burnManagerId: null,
    poolsId: null,
    globalConfigId: null,
    thresholdConfigId: null,
  };
}
