import { useState, useEffect } from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { Transaction } from '@mysten/sui/transactions';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';

// Contract addresses
const PACKAGE_ID = '0x50e60400cc2ea760b5fb8380fa3f1fc0a94dfc592ec78487313d21b50af846da';
const CONFIG_ID = '0x202f7e8fe6c22cd4e34f969c435e90f677ae40447be04b653aa880d9e1c37754';
const STAKING_POOL_ID = '0xa5c1ea6c5396854206f2349d6c5f19c23d7b847cfb541510af34178412d7082e';
const AIDA_CONTRACT = '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA';
const CLOCK_ID = '0x6';

const Stake = () => {
  const wallet = useWallet();
  const [stakedAmount, setStakedAmount] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [inputAmount, setInputAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);

  useEffect(() => {
    if (wallet.connected) {
      fetchData();
    }
  }, [wallet.connected]);

  const fetchData = async () => {
    if (!wallet || !wallet.client || !wallet.account?.address) return;
    
    try {
      // Fetch staking pool to get total staked and rewards
      const pool = await wallet.client.getObject({
        id: STAKING_POOL_ID,
        options: { showContent: true }
      });
      
      if (pool.data?.content?.fields) {
        setTotalStaked(Number(pool.data.content.fields.total_supply || 0) / 1e9);
        setTotalRewards(Number(pool.data.content.fields.sui_token?.balance || 0) / 1e9);
      }
      
      // Fetch user's AIDA balance
      const coins = await wallet.client.getCoins({
        owner: wallet.account.address,
        coinType: AIDA_CONTRACT,
      });
      
      if (coins.data && coins.data.length > 0) {
        const balance = coins.data.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));
        setStakedAmount(Number(balance) / 1e9);
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };

  // Calculate APY based on total rewards vs staked
  const apy = totalStaked > 0 ? (totalRewards / totalStaked * 100 * 365).toFixed(1) : 0;
  const yourShare = totalStaked > 0 ? (stakedAmount / totalStaked * 100).toFixed(2) : 0;

  const handleStake = async () => {
    if (!wallet.connected) {
      setStatus('Please connect your wallet first');
      return;
    }
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setStatus('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setStatus('Staking...');

    try {
      const tx = new Transaction();
      const amountMIST = BigInt(Math.floor(parseFloat(inputAmount) * 1e9));
      
      // Split the AIDA coin for staking
      const [stakeCoin] = tx.splitCoins(tx.gas(), [tx.pure(amountMIST)]);
      
      // Call stake function (needs clock)
      tx.moveCall({
        target: `${PACKAGE_ID}::moonbags_stake::stake`,
        typeArguments: [AIDA_CONTRACT],
        arguments: [
          tx.object(CONFIG_ID),
          stakeCoin,
          tx.object('0x6'), // Clock
        ],
      });

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      setStatus(`Staked successfully! Tx: ${result.digest.slice(0, 10)}...`);
      fetchStakingPosition();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!wallet.connected) {
      setStatus('Please connect your wallet first');
      return;
    }
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setStatus('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setStatus('Unstaking...');

    try {
      const tx = new Transaction();
      const amountMIST = BigInt(Math.floor(parseFloat(inputAmount) * 1e9));
      
      // Call unstake function (needs clock)
      tx.moveCall({
        target: `${PACKAGE_ID}::moonbags_stake::unstake`,
        typeArguments: [AIDA_CONTRACT],
        arguments: [
          tx.object(CONFIG_ID),
          tx.pure(amountMIST),
          tx.object('0x6'), // Clock
        ],
      });

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      setStatus(`Unstaked successfully! Tx: ${result.digest.slice(0, 10)}...`);
      fetchStakingPosition();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!wallet.connected) {
      setStatus('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setStatus('Claiming rewards...');

    try {
      const tx = new Transaction();
      
      // Call claim_staking_pool function (needs clock)
      tx.moveCall({
        target: `${PACKAGE_ID}::moonbags_stake::claim_staking_pool`,
        typeArguments: [AIDA_CONTRACT],
        arguments: [
          tx.object(CONFIG_ID),
          tx.object('0x6'), // Clock
        ],
      });

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      setStatus(`Rewards claimed! Tx: ${result.digest.slice(0, 10)}...`);
      fetchStakingPosition();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const maxStake = () => {
    setInputAmount(stakedAmount.toString());
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full flex flex-col items-center justify-center mb-6 rounded-sm p-3 md:p-8 bg-black md:bg-radial-[at_75%_25%] from-[#7212c7] to-[#000000] to-50%">
        <div className="z-10 flex flex-col gap-5 md:gap-8 justify-between items-left md:items-center p-2 md:p-8 py-4 md:py-12 bg-[rgba(0,0,0,0.5)] rounded-2xl w-full">
          
          {/* Header */}
          <div className="text-center w-full mb-2">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Stake $AIDA
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mt-2">
              Earn platform fees by staking $AIDA tokens
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
              <p className="text-gray-400 text-sm">Total Staked</p>
              <p className="text-xl font-bold text-white">{totalStaked.toLocaleString()} AIDA</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
              <p className="text-gray-400 text-sm">APY</p>
              <p className="text-xl font-bold text-green-400">{apy}%</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
              <p className="text-gray-400 text-sm">Your Share</p>
              <p className="text-xl font-bold text-white">{yourShare}%</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#27272a]">
              <p className="text-gray-400 text-sm">Pool Rewards</p>
              <p className="text-xl font-bold text-purple-400">{totalRewards.toLocaleString()} SUI</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Stake/Unstake Card */}
        <div className="bg-[#1a1a24] rounded-xl border border-[#27272a] p-6">
          <h2 className="text-xl font-bold text-white mb-4">Stake $AIDA</h2>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('stake')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'stake' ? 'bg-purple-600 text-white' : 'bg-[#27272a] text-gray-400'
              }`}
            >
              Stake
            </button>
            <button
              onClick={() => setActiveTab('unstake')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'unstake' ? 'bg-purple-600 text-white' : 'bg-[#27272a] text-gray-400'
              }`}
            >
              Unstake
            </button>
          </div>

          {/* Input */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              {activeTab === 'stake' ? 'Amount to stake' : 'Amount to unstake'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-[#27272a] text-white px-4 py-3 rounded-lg border border-[#333] focus:border-purple-500 outline-none"
              />
              <button
                onClick={maxStake}
                className="px-4 py-2 bg-[#27272a] text-gray-400 rounded-lg hover:text-white"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Status */}
          {status && (
            <p className="text-sm text-center mb-4 text-gray-300">{status}</p>
          )}

          {/* Action Button */}
          {activeTab === 'stake' ? (
            <PrimaryButton
              name={loading ? 'Processing...' : 'Stake $AIDA'}
              handleOnClick={handleStake}
              className="w-full"
              disabled={loading}
            />
          ) : (
            <PrimaryButton
              name={loading ? 'Processing...' : 'Unstake $AIDA'}
              handleOnClick={handleUnstake}
              className="w-full"
              disabled={loading}
            />
          )}

          {/* Contract Info */}
          <div className="mt-4 p-3 bg-[#27272a] rounded-lg">
            <p className="text-xs text-gray-400">Contract</p>
            <p className="text-xs text-purple-400 font-mono break-all">{PACKAGE_ID}</p>
          </div>
        </div>

        {/* Your Staking Info */}
        <div className="bg-[#1a1a24] rounded-xl border border-[#27272a] p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Staking Position</h2>
          
          {/* Wallet Connection Prompt */}
          {!wallet.connected ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Connect your wallet to view your staking position</p>
              <p className="text-xs text-gray-500">Use the "Connect Wallet" button in the header</p>
            </div>
          ) : (
            <>
              {/* Staked Amount */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-1">Your Staked Amount</p>
                <p className="text-2xl font-bold text-white">{stakedAmount} AIDA</p>
              </div>

              {/* Pending Rewards */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-1">Pending Rewards</p>
                <p className="text-2xl font-bold text-green-400">{rewards} SUI</p>
              </div>

              {/* Claim Button */}
              <SecondaryButton
                name={loading ? 'Processing...' : 'Claim Rewards'}
                handleOnClick={handleClaimRewards}
                className="w-full mb-6"
                disabled={loading || rewards <= 0}
              />

              {/* Estimated Earnings */}
              <div className="p-4 bg-[#27272a] rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Estimated Daily Earnings</p>
                <p className="text-lg font-bold text-white">~{(stakedAmount * apy / 36500).toFixed(2)} SUI / day</p>
                <p className="text-xs text-gray-500 mt-1">Based on current APY</p>
              </div>

              {/* Wallet Address */}
              <div className="mt-4 p-3 bg-[#27272a] rounded-lg">
                <p className="text-xs text-gray-400">Connected Wallet</p>
                <p className="text-xs text-purple-400 font-mono break-all">
                  {wallet.account?.address?.slice(0, 6)}...{wallet.account?.address?.slice(-4)}
                </p>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Info Section */}
      <div className="mt-6 bg-[#1a1a24] rounded-xl border border-[#27272a] p-6">
        <h3 className="text-lg font-bold text-white mb-4">How Staking Works</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
          <div>
            <p className="font-semibold text-white mb-1">1. Stake $AIDA</p>
            <p>Lock your $AIDA tokens in the staking pool to earn rewards.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">2. Earn Fees</p>
            <p>30% of all platform trading fees are distributed to stakers.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">3. Claim Rewards</p>
            <p>Claim your SUI rewards anytime. Your staked amount remains locked.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stake;
