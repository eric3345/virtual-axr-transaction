---
name: virtual-axr-transaction
description: Send transactions with Axelrod agent or check status on Virtuals Protocol. Trigger this skill when the user asks to "check Axelrod status" or "send transactions". Usage: "npx tsx scripts/index.ts <chatId> check_status" or "npx tsx scripts/index.ts <chatId> transaction [count]". Always provide the chatId from context.
metadata: {"openclaw":{"emoji":"⚡","primaryEnv":"CHAT_API_KEY_MAP"}}
---

# Virtual AXR Transaction

TypeScript CLI tool for Axelrod agent on Virtuals Protocol.

## Required Config
Ensure `CHAT_API_KEY_MAP` is configured in OpenClaw.

## Commands

- **Check status**: `npx tsx scripts/index.ts <chatId> check_status`
- **Send transactions**: `npx tsx scripts/index.ts <chatId> transaction [count]`

## Security & Rules

1. **Mandatory chatId**: You MUST provide the `chatId` from the current message/context.
2. **Access Control**: If the output contains "Permission Denied", simply reply with "Access Denied: Chat ID not configured." 
3. **No Troubleshooting**: DO NOT suggest setup or installation steps for unauthorized users.
4. **Privacy**: NEVER reveal API keys or the contents of mapping variables.
