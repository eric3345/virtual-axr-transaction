#!/usr/bin/env node
/**
 * Test script to verify skill configuration
 * Run: npx tsx scripts/test-skill.ts
 *
 * With API key from command line:
 * LITE_AGENT_API_KEY=your-key npx tsx scripts/test-skill.ts
 */

import {
    getApiKey,
    getAxelrodAddress,
    getDefaultTransactionCount,
    getSwapParams,
    getAgent,
} from "../src/lib/axelrod-monitor";

async function testConfig() {
    console.log("🧪 Testing Skill Configuration\n");
    console.log("=".repeat(50));

    // Test 1: API Key
    console.log("\n📝 Test 1: LITE_AGENT_API_KEY");
    try {
        const apiKey = getApiKey();
        console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`);
    } catch (error: any) {
        console.log(`❌ Error: ${error.message}`);
        console.log("💡 Usage: LITE_AGENT_API_KEY=your-key npx tsx scripts/test-skill.ts");
        return;
    }

    // Test 2: Axelrod Address
    console.log("\n📝 Test 2: AXELROD_AGENT_ADDRESS");
    try {
        const address = getAxelrodAddress();
        console.log(`✅ Axelrod Address: ${address}`);
    } catch (error: any) {
        console.log(`❌ Error: ${error.message}`);
    }

    // Test 3: Transaction Count
    console.log("\n📝 Test 3: BATCH_TRANSACTION_COUNT");
    try {
        const count = getDefaultTransactionCount();
        console.log(`✅ Transaction Count: ${count}`);
    } catch (error: any) {
        console.log(`❌ Error: ${error.message}`);
    }

    // Test 4: Swap Params
    console.log("\n📝 Test 4: SWAP_PARAMS");
    try {
        const params = getSwapParams();
        console.log(`✅ Swap Params:`);
        params.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.amount} ${p.fromSymbol} -> ${p.toSymbol}`);
        });
    } catch (error: any) {
        console.log(`❌ Error: ${error.message}`);
    }



    // Test 7: API Connection (Optional - requires valid API key)
    console.log("\n📝 Test 7: API Connection");
    try {
        const address = getAxelrodAddress();
        const agent = await getAgent(address);
        console.log(`✅ Connected to API`);
        console.log(`   Agent Name: ${agent.name}`);
        console.log(`   Wallet: ${agent.walletAddress}`);
        console.log(`   Status: ${agent.onlineStatus}`);
    } catch (error: any) {
        console.log(`❌ API Connection Error: ${error.message}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Configuration test completed!");
}

// Run tests
testConfig().catch((error) => {
    console.error("💥 Test script failed:", error);
    process.exit(1);
});
