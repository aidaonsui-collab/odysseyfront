// ============================================================
// TheOdyssey.fun — Canonical Contract Config
// ONE source of truth. Import from here. Never hardcode elsewhere.
// ============================================================

// ── Moonbags Package (THE contract we use for everything) ──
export const MOONBAGS_PACKAGE = '0x50e60400cc2ea760b5fb8380fa3f1fc0a94dfc592ec78487313d21b50af846da';

// ── Shared Objects (created by moonbags init tx: CdcHE8XZU2Hr1kbGbWcBwRyDnFGZRRFQyerGMd9knAeB) ──
export const MOONBAGS_CONFIG      = '0x1fd45c94f890d3748e002c3636ea0dfc6e3bca0823269cb4119800369b43b07f'; // moonbags::Configuration
export const MOONBAGS_STAKE_CONFIG = '0x9e5b64163883d58ff8a52bc566b59f383ea88d69907986c19dc57018171e6f49'; // moonbags_stake::Configuration
export const MOONBAGS_LOCK_CONFIG  = '0xef887ab6838b42171ba5f1a645f10724d4960a1cefab216a0269e5ac5a531006'; // moonbags_token_lock::Configuration

// ── SUI system objects ──
export const SUI_CLOCK = '0x0000000000000000000000000000000000000000000000000000000000000006';
export const QUOTE_COIN = '0x2::sui::SUI';

// ── AIDA token (platform token for staking) ──
export const AIDA_TOKEN = '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA';

// ── Fee constants (match contract) ──
export const POOL_CREATION_FEE_MIST = 10_000_000n;  // 0.01 SUI
export const TRADING_FEE_BPS        = 200;           // 2%
export const DEFAULT_SLIPPAGE_BPS   = 200;           // 2%
export const GRADUATION_THRESHOLD   = 3_000_000_000n; // 3 SUI

// ── Backend ──
export const BACKEND_URL = 'https://theodyssey-backend-production.up.railway.app/api/v1';

// ── RPC ──
export const SUI_RPC = 'https://fullnode.mainnet.sui.io';

// ── Functions ──
export const FN = {
  CREATE: `${MOONBAGS_PACKAGE}::moonbags::create`,
  BUY:    `${MOONBAGS_PACKAGE}::moonbags::buy`,
  SELL:   `${MOONBAGS_PACKAGE}::moonbags::sell`,
  STAKE:  `${MOONBAGS_PACKAGE}::moonbags_stake::stake`,
  UNSTAKE:`${MOONBAGS_PACKAGE}::moonbags_stake::unstake`,
};
