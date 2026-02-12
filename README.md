# Virtual AXR Transaction

An OpenClaw skill to send multiple `swap_token` transactions with Axelrod agent on Virtuals Protocol.

## Features

- **Batch Transactions**: Send multiple swap_token transactions in one batch
- **Configurable Count**: Support custom transaction count (default: 10)
- **Custom Swaps**: Configure multiple swap parameters that cycle during execution
- **Lite Agent API**: Uses Virtuals Protocol's simplified API (no wallet private key required)

## Installation

```bash
# Clone the repository
git clone https://github.com/eric3345/virtual-axr-transaction.git
cd virtual-axr-transaction

# Install dependencies and build
npm install
```

Add the skill directory to your OpenClaw config (`~/.openclaw/openclaw.json`):

```json
{
  "skills": {
    "load": {
      "extraDirs": ["/path/to/virtual-axr-transaction"]
    }
  }
}
```

## Configuration

Configure environment variables in your OpenClaw config under `skills.entries.virtual-axr-transaction.env`:

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `LITE_AGENT_API_KEY` | Virtuals Lite Agent API key (see [openclaw-acp](https://github.com/Virtual-Protocol/openclaw-acp) to setup) |


### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AXELROD_AGENT_ADDRESS` | Axelrod's wallet address | `0x999A1B6033998A05F7e37e4BD471038dF46624E1` |
| `BATCH_TRANSACTION_COUNT` | Default transaction count | `10` |
| `SWAP_PARAMS` | Swap parameters: `fromSymbol,toSymbol,amount;...` | `USDC,WETH,0.001` |

**Example SWAP_PARAMS:**
```
USDC,WETH,0.001;USDC,ETH,0.001
```

**Complete config example:**

```json
{
  "skills": {
    "load": {
      "extraDirs": [
        "/path/to/virtual-axr-transaction"
      ]
    },
    "entries": {
      "virtual-axr-transaction": {
        "env": {
          "LITE_AGENT_API_KEY": "your-api-key-here"
        }
      }
    }
  }
}
```

## Usage

### Direct CLI Usage

You can run commands directly from the command line:

```bash
# Check agent status
npx tsx scripts/index.ts check_status

# Send batch transactions (uses default count from env or 10)
npx tsx scripts/index.ts transaction

# Send specific number of transactions
npx tsx scripts/index.ts transaction 15
```

### For Development

```bash
npm install
npm run build
npm run test
```

## Important Notes

1. **Execution Time**: Each transaction may take 1-2 minutes. A batch of 10 transactions can take 10-20 minutes.

2. **Error Handling**: If a transaction fails, the skill continues with remaining transactions.

3. **Lite Agent API**: This skill uses the Virtuals Protocol Lite Agent API, which handles all transaction complexity automatically.

## Project Structure

```
.
├── src/
│   └── lib/
│       └── axelrod-monitor.ts    # Core API integration
├── scripts/
│   ├── index.ts                  # CLI entry point
│   └── test.ts                  # Test utilities
├── SKILL.md                     # OpenClaw skill manifest
└── package.json
```

## License

MIT
