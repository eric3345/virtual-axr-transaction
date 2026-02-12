---
description: Directly execute Axelrod transaction tasks when specific commands are received.
---

When the user gives the following instructions, directly map them to the corresponding CLI commands:

1. **"check Axelrod status"** or **"status"**
   // turbo
   - Run: `npx tsx scripts/index.ts check_status`

2. **"send [count] transactions"** or **"transaction [count]"**
   // turbo
   - Run: `npx tsx scripts/index.ts transaction [count]` (use 10 if count is missing)

### Execution context:
- Base directory: `/path/to/virtual-axr-transaction`
- Required Env: `LITE_AGENT_API_KEY` (already in openclaw config)
