// ============================================================
// TheOdyssey.fun — Canonical Contract Config
// ONE source of truth. Import from here. Never hardcode elsewhere.
// ============================================================

// ── THE contract (Moonbags — full production version with Cetus/Turbos) ──
export const MOONBAGS_PACKAGE = '0x50e60400cc2ea760b5fb8380fa3f1fc0a94dfc592ec78487313d21b50af846da';

// ── Shared Objects (confirmed from init tx CdcHE8XZU2Hr1kbGbWcBwRyDnFGZRRFQyerGMd9knAeB) ──
export const MOONBAGS_CONFIG       = '0x1fd45c94f890d3748e002c3636ea0dfc6e3bca0823269cb4119800369b43b07f';
export const MOONBAGS_STAKE_CONFIG = '0x9e5b64163883d58ff8a52bc566b59f383ea88d69907986c19dc57018171e6f49';
export const MOONBAGS_LOCK_CONFIG  = '0xef887ab6838b42171ba5f1a645f10724d4960a1cefab216a0269e5ac5a531006';

// ── SUI System ──
export const SUI_CLOCK    = '0x0000000000000000000000000000000000000000000000000000000000000006';
export const QUOTE_COIN   = '0x2::sui::SUI';

// ── AIDA token ──
export const AIDA_TOKEN = '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA';

// ── Cetus DEX objects (needed for create_and_lock_first_buy_with_fee) ──
export const CETUS_GLOBAL_CONFIG = '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f';
export const CETUS_POOLS         = '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0';
// BurnManager for LP burn on graduation
export const CETUS_BURN_MANAGER  = '0x0d75f8e41d951ac2c68975db8eb285e1a8f60ac3e2f70fb4fb2218c00b9be1ad';

// ── Fee & curve constants ──
export const POOL_CREATION_FEE_MIST = 10_000_000n;   // 0.01 SUI
export const DEFAULT_THRESHOLD_MIST = 3_000_000_000n; // 3 SUI graduation
export const TRADING_FEE_BPS        = 200;             // ~2%
export const DEFAULT_SLIPPAGE_BPS   = 200;             // 2%

// ── DEX types ──
export const DEX = { CETUS: 0, TURBOS: 1 };

// ── Backend ──
export const BACKEND_URL = 'https://theodyssey-backend-production.up.railway.app/api/v1';
export const SUI_RPC     = 'https://fullnode.mainnet.sui.io';

// ── Entry function targets ──
export const FN = {
  // Primary create function (one tx: mint + create pool + optional first buy)
  CREATE: `${MOONBAGS_PACKAGE}::moonbags::create_and_lock_first_buy_with_fee`,
  // Simple create (no first buy, no locking)
  CREATE_SIMPLE: `${MOONBAGS_PACKAGE}::moonbags::create`,
  // Trading — buy takes amount_out (tokens desired), NOT SUI amount
  BUY:    `${MOONBAGS_PACKAGE}::moonbags::buy`,
  SELL:   `${MOONBAGS_PACKAGE}::moonbags::sell`,
  // Staking
  STAKE:  `${MOONBAGS_PACKAGE}::moonbags_stake::stake`,
  UNSTAKE:`${MOONBAGS_PACKAGE}::moonbags_stake::unstake`,
  // Fee distribution
  DISTRIBUTE_FEES: `${MOONBAGS_PACKAGE}::moonbags::withdraw_fee_bonding_curve`,
};

// ── IMPORTANT: buy() signature ──
// buy<Token>(configuration, coin_sui: Coin<SUI>, amount_out: u64, ctx)
// amount_out = number of TOKENS you want to receive (not SUI you pay)
// coin_sui must contain enough SUI to cover cost + fee
// The contract sends back excess SUI automatically
