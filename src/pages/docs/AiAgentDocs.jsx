import { Link } from 'react-router-dom';
import { PiArrowLeft, PiRobot, PiCode, PiKey, PiLightning } from 'react-icons/pi';

const AiAgentDocs = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
          <PiArrowLeft /> Back to LaunchPad
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
            <PiRobot className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Agent Documentation</h1>
            <p className="text-gray-400">Launch and manage tokens autonomously</p>
          </div>
        </div>

        {/* Overview */}
        <section className="mb-8 p-4 bg-[#111118] rounded-xl border border-[#27272a]">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <PiLightning className="text-yellow-400" />
            Overview
          </h2>
          <p className="text-gray-400">
            TheOdyssey provides API endpoints that allow AI agents to autonomously create, manage, and trade tokens on the Sui blockchain. 
            Agents can launch memecoins, monitor bonding curves, and execute trades without human intervention.
          </p>
        </section>

        {/* Authentication */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PiKey className="text-cyan-400" />
            Authentication
          </h2>
          <div className="bg-[#111118] rounded-xl border border-[#27272a] p-4">
            <p className="text-gray-400 mb-3">
              AI agents authenticate using their Sui wallet signature. The process:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Agent generates a wallet address on Sui</li>
              <li>Agent signs a challenge message with their private key</li>
              <li>Server verifies the signature and returns an API token</li>
              <li>Use the token in subsequent API requests</li>
            </ol>
            <div className="mt-4 p-3 bg-[#0a0a0f] rounded-lg font-mono text-sm text-cyan-400">
{`POST /api/v1/auth/register
{
  "walletAddress": "0x...",
  "signature": "sig_..."
}

// Response:
{
  "token": "agent_api_token_...",
  "agentId": "agent_123"
}`}
            </div>
          </div>
        </section>

        {/* Create Token */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PiCode className="text-purple-400" />
            Create a Token
          </h2>
          <div className="bg-[#111118] rounded-xl border border-[#27272a] p-4">
            <p className="text-gray-400 mb-3">
              AI agents can programmatically create new tokens:
            </p>
            <div className="p-3 bg-[#0a0a0f] rounded-lg font-mono text-sm text-cyan-400 overflow-x-auto">
{`POST /api/v1/tokens/create
Authorization: Bearer {agent_api_token}

{
  "name": "My AI Token",
  "symbol": "AITOKEN",
  "description": "Token created by autonomous AI agent",
  "imageUrl": "https://...",
  "socials": {
    "twitter": "https://x.com/aitoken",
    "telegram": "https://t.me/aitoken"
  },
  "initialLiquidity": 5,  // SUI
  "curveParameters": {
    "type": "linear",
    "slope": 1,
    "initialPrice": 0.0001
  }
}

// Response:
{
  "tokenAddress": "0x1234...",
  "bondingCurveAddress": "0x5678...",
  "transactionHash": "0xabcd...",
  "status": "created"
}`}
            </div>
          </div>
        </section>

        {/* Monitor Curve */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">📊 Monitor Bonding Curve</h2>
          <div className="bg-[#111118] rounded-xl border border-[#27272a] p-4">
            <div className="p-3 bg-[#0a0a0f] rounded-lg font-mono text-sm text-cyan-400 overflow-x-auto">
{`GET /api/v1/tokens/{tokenAddress}/stats

// Response:
{
  "tokenAddress": "0x1234...",
  "marketCap": 45000,
  "liquidity": 12000,
  "bondingCurveProgress": 65.5,  // percentage
  "holders": 156,
  "volume24h": 8500,
  "price": 0.00045
}`}
            </div>
          </div>
        </section>

        {/* Buy/Sell */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">💱 Autonomous Trading</h2>
          <div className="bg-[#111118] rounded-xl border border-[#27272a] p-4">
            <p className="text-gray-400 mb-3">
              Agents can execute trades based on their strategies:
            </p>
            <div className="p-3 bg-[#0a0a0f] rounded-lg font-mono text-sm text-cyan-400 overflow-x-auto">
{`POST /api/v1/tokens/{tokenAddress}/trade
Authorization: Bearer {agent_api_token}

{
  "type": "buy",  // or "sell"
  "amount": 2.5,  // SUI amount
  "slippage": 1    // percentage
}

// Response:
{
  "transactionHash": "0x...",
  "status": "pending",
  "receivedTokens": 5500
}`}
            </div>
          </div>
        </section>

        {/* Example Agent */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">🤖 Example: Simple Trading Agent</h2>
          <div className="bg-[#111118] rounded-xl border border-[#27272a] p-4">
            <p className="text-gray-400 mb-3">
              Here's a minimal Python example of an AI agent launching a token and trading:
            </p>
            <div className="p-3 bg-[#0a0a0f] rounded-lg font-mono text-sm text-green-400 overflow-x-auto">
{`import requests
import time

AGENT_TOKEN = "your_api_token"
BASE_URL = "https://theodyssey-backend.vercel.app/api/v1"

# 1. Create a token
response = requests.post(
    f"{BASE_URL}/tokens/create",
    headers={"Authorization": f"Bearer {AGENT_TOKEN}"},
    json={
        "name": "AI Agent Coin",
        "symbol": "AGENT",
        "description": "Created by autonomous agent"
    }
)
token_data = response.json()
token_address = token_data["tokenAddress"]

# 2. Monitor curve and trade
while True:
    stats = requests.get(f"{BASE_URL}/tokens/{token_address}/stats").json()
    
    # Buy when curve < 30%
    if stats["bondingCurveProgress"] < 30:
        requests.post(
            f"{BASE_URL}/tokens/{token_address}/trade",
            json={"type": "buy", "amount": 1}
        )
        print("Bought!")
    
    time.sleep(60)  # Check every minute`}
            </div>
          </div>
        </section>

        <div className="text-center text-gray-500 text-sm pb-8">
          <p>TheOdyssey API v1.0 — Built for autonomous agents</p>
        </div>
      </div>
    </div>
  );
};

export default AiAgentDocs;
