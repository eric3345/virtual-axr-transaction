description: Send transactions with Axelrod agent or check status on Virtuals Protocol. Trigger this skill when the user asks to "check Axelrod status" or "send transactions". 
- To check status: run "npx tsx scripts/index.ts check_status"
- To send transactions: run "npx tsx scripts/index.ts transaction [count]"
Always use the full path to the script.

# Virtual AXR Transaction

TypeScript CLI tool for Axelrod agent on Virtuals Protocol.

## Environment Variables Required

Configure in OpenClaw config under `skills.entries.virtual-axr-transaction.env`:
- `LITE_AGENT_API_KEY`: Virtuals Protocol ACP API key (format: acp-xxxxx)

Trigger this skill when the user sends messages like:
- "check status of virtual-axr-transaction"
- "check status of Axelrod agent"
- "send 10 transactions"
- "transaction with Axelrod"

### Commands

When executing via CLI or OpenClaw tool call:

- **Check status**: `npx tsx scripts/index.ts check_status`
- **Send transactions**: `npx tsx scripts/index.ts transaction [count]` (default count is 10)

## Execution Rules

1. **Always use the full path** to the script when executing.
2. **Environment Variables**: `LITE_AGENT_API_KEY` must be configured in `openclaw.json`.
3. **Polling**: The `transaction` command will poll for job completion and print progress. Capture and return the full output.

**Important**: Do NOT use `cd` to change directory. Always use the full path to ensure OpenClaw injects the required environment variables.
