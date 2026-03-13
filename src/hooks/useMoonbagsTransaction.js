// Moonbags Transaction Builder - Bonding Curve Only
// No Cetus needed for initial buys!

export const MOONBAGS_CONFIG = {
  packageId: '0xffbc1d872f92494c41eb6483033a647d51c59c3f813070ea2ecf6023881376f4',
  configId: '0x202f7e8fe6c22cd4e34f969c435e90f677ae40447be04b653aa880d9e1c37754',
  clockId: '0x6',
  suiMetadataId: '0x1',
};

/**
 * Build CREATE TOKEN transaction (create_and_lock_first_buy_with_fee)
 * 
 * This creates:
 * 1. The coin (TreasuryCap + Metadata)
 * 2. The bonding curve pool
 * 3. Initial liquidity (from creator's SUI)
 * 4. First buy on bonding curve (NO Cetus needed!)
 * 
 * @param params.name - Token name (e.g., "My Token")
 * @param params.symbol - Token symbol (e.g., "MYT")  
 * @param params.description - Token description
 * @param params.uri - Image URL
 * @param params.twitter - Twitter handle
 * @param params.telegram - Telegram handle
 * @param params.website - Website URL
 * @param params.initialSui - Initial SUI for liquidity (in SUI, not MIST)
 * @param params.migrationDex - 0=Cetus, 1=Turbos (for future migration)
 */
export function buildCreateTokenTx(params) {
  const {
    name,
    symbol,
    description = '',
    uri = '',
    twitter = '',
    telegram = '',
    website = '',
    initialSui = 1,
    migrationDex = 0,
  } = params;

  // Convert SUI to MIST (1 SUI = 1e9 MIST)
  const initialSuiMist = BigInt(initialSui) * 1_000_000_000n;

  return {
    packageId: MOONBAGS_CONFIG.packageId,
    module: 'moonbags',
    function: 'create_and_lock_first_buy_with_fee',
    typeArguments: [`\${sender}::\${symbol.toLowerCase()}::\${symbol.toUpperCase()}`],
    arguments: {
      // Both config and stake_config use the same config object
      configuration: MOONBAGS_CONFIG.configId,
      stake_config: MOONBAGS_CONFIG.configId,
      // Threshold config - use zero address for default
      threshold_config: '0x0000000000000000000000000000000000000000000000000000000000000000',
      // Treasury cap - from coin::create_currency (passed as argument)
      treasury_cap: 'treasury_cap', // Created in tx
      // Migration dex: 0 = Cetus, 1 = Turbos  
      migration_dex: migrationDex,
      // Initial SUI for liquidity
      coin_sui: 'initial_sui', // Split from gas
      // Virtual token reserves (determines initial price)
      initial_virtual_token_reserves: 1000000000, // 1B tokens virtual
      // Lock duration (optional)
      lock_duration: null,
      // Threshold (0 = use default)
      threshold: 0,
      // Clock
      clock: MOONBAGS_CONFIG.clockId,
      // Token metadata
      name,
      symbol: symbol.toUpperCase(),
      uri,
      description,
      twitter,
      telegram,
      website,
      // These are placeholders - for the actual tx these need to be fetched
      // But for bonding curve operations, they're not critical
      burn_manager: '0x0000000000000000000000000000000000000000000000000000000000000000',
      pools: '0x0000000000000000000000000000000000000000000000000000000000000000',  
      global_config: '0x0000000000000000000000000000000000000000000000000000000000000000',
      sui_metadata: MOONBAGS_CONFIG.suiMetadataId,
      // Token metadata - from coin::create_currency
      token_metadata: 'token_metadata',
    },
    initialSuiMist: initialSuiMist.toString(),
  };
}

/**
 * SIMPLE BUY - Bonding curve only!
 * No Cetus needed!
 * 
 * @param params.tokenType - Full token type (e.g., "0x123::mytoken::MYTOKEN")
 * @param params.amountOut - Amount of tokens to receive
 */
export function buildBuyTx(params) {
  const { tokenType, amountOut } = params;
  
  return {
    packageId: MOONBAGS_CONFIG.packageId,
    module: 'moonbags',
    function: 'buy',
    typeArguments: [tokenType],
    arguments: {
      configuration: MOONBAGS_CONFIG.configId,
      coin_sui: 'sui_coin', // Split from gas
      amount_out: amountOut,
    },
  };
}

/**
 * SIMPLE SELL - Bonding curve only!
 * No Cetus needed!
 * 
 * @param params.tokenType - Full token type
 * @param params.tokenAmount - Amount of tokens to sell
 * @param params.amountOutMin - Minimum SUI to receive (slippage)
 */
export function buildSellTx(params) {
  const { tokenType, tokenAmount, amountOutMin = 0 } = params;
  
  return {
    packageId: MOONBAGS_CONFIG.packageId,
    module: 'moonbags',
    function: 'sell',
    typeArguments: [tokenType],
    arguments: {
      configuration: MOONBAGS_CONFIG.configId,
      coin_token: 'token_coin', // User's tokens
      amount_out_min: amountOutMin,
      clock: MOONBAGS_CONFIG.clockId,
    },
  };
}

// Helper to get token type address
export function getTokenType(sender, symbol) {
  return `${sender}::${symbol.toLowerCase()}::${symbol.toUpperCase()}`;
}
