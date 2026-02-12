#!/usr/bin/env node
import axios from "axios";
import "dotenv/config";

const API_BASE_URL = "https://claw-api.virtuals.io";
const AXELROD_ADDRESS = process.env.AXELROD_AGENT_ADDRESS || "0x999A1B6033998A05F7e37e4BD471038dF46624E1";

function createClient() {
    const apiKey = process.env.LITE_AGENT_API_KEY;
    const chatId = process.env.CHAT_ID;

    if (!apiKey) {
        throw new Error("Missing LITE_AGENT_API_KEY");
    }
    if (!chatId) {
        throw new Error("Missing CHAT_ID");
    }

    // Note: In real scenarios, we would verify the 1-1 mapping here.
    // For this direct test script, we just ensure both are present.

    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
        },
    });
}

// Test 1: Check if we can reach the API
async function testApiConnection() {
    console.log("\n=== Test 1: API Connection ===");
    try {
        const client = createClient();
        // Try to browse agents
        const response = await client.get("/acp/agents?query=Axelrod");
        console.log("✅ API Connection OK");
        console.log("Found agents:", response.data.data?.length || 0);
        return true;
    } catch (error: any) {
        console.error("❌ API Connection Failed:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        return false;
    }
}

// Test 2: Get Axelrod agent info
async function testGetAxelrod() {
    console.log("\n=== Test 2: Get Axelrod Agent Info ===");
    try {
        const client = createClient();
        const response = await client.get(`/acp/agents?query=${encodeURIComponent(AXELROD_ADDRESS)}`);

        const agents = response.data.data;
        const axelrod = agents.find((a: any) =>
            a.walletAddress.toLowerCase() === AXELROD_ADDRESS.toLowerCase()
        );

        if (!axelrod) {
            console.error("❌ Axelrod agent not found");
            return null;
        }

        console.log("✅ Found Axelrod:");
        console.log("  Name:", axelrod.name);
        console.log("  Wallet:", axelrod.walletAddress);
        console.log("  Graduation Status:", axelrod.graduationStatus);
        console.log("  Online Status:", axelrod.onlineStatus);
        console.log("  Job Offerings:", axelrod.jobOfferings?.length || 0);

        if (axelrod.jobOfferings && axelrod.jobOfferings.length > 0) {
            console.log("\n  Available Jobs:");
            axelrod.jobOfferings.forEach((job: any) => {
                console.log(`    - ${job.name} (${job.price} ${job.priceType})`);
                console.log(`      Requirement: ${job.requirement || 'N/A'}`);
            });
        }

        return axelrod;
    } catch (error: any) {
        console.error("❌ Get Axelrod Failed:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        return null;
    }
}

// Test 3: Create a single swap_token job
async function testCreateJob() {
    console.log("\n=== Test 3: Create swap_token Job ===");
    try {
        const client = createClient();

        const jobParams = {
            fromSymbol: "USDC",
            toSymbol: "WETH",
            amount: 0.001
        };

        console.log("Creating job with params:", JSON.stringify(jobParams, null, 2));

        const response = await client.post("/acp/jobs", {
            providerWalletAddress: AXELROD_ADDRESS,
            jobOfferingName: "swap_token",
            serviceRequirements: jobParams,
        });

        const jobId = response.data.data?.jobId;
        console.log("✅ Job Created Successfully!");
        console.log("  Job ID:", jobId);
        return jobId;
    } catch (error: any) {
        console.error("❌ Create Job Failed:");
        console.error("  Message:", error.message);
        if (error.response) {
            console.error("  Status:", error.response.status);
            console.error("  Data:", error.response.data);
        }
        return null;
    }
}

// Test 4: Check job status (with timeout)
async function testJobStatus(jobId: number, timeoutMs: number = 60000) {
    console.log(`\n=== Test 4: Check Job Status (timeout: ${timeoutMs}ms) ===`);

    const startTime = Date.now();
    let pollCount = 0;

    try {
        const client = createClient();

        while (Date.now() - startTime < timeoutMs) {
            pollCount++;

            try {
                const response = await client.get(`/acp/jobs/${jobId}`);
                const data = response.data.data;

                console.log(`[${pollCount}] Job #${jobId} - Phase: ${data.phase}`);

                if (data.phase === "COMPLETED") {
                    console.log("✅ Job Completed!");
                    console.log("  Deliverable:", data.deliverable || "N/A");
                    return data;
                }

                if (data.phase === "REJECTED") {
                    console.error("❌ Job Rejected!");
                    console.error("  Reason:", data.latestMemo?.signedReason || "Unknown");
                    return null;
                }

                if (data.phase === "EXPIRED") {
                    console.error("❌ Job Expired!");
                    return null;
                }

                // Check for memos
                if (data.memos && data.memos.length > 0) {
                    const latestMemo = data.memos[data.memos.length - 1];
                    console.log(`  Latest Memo: ${latestMemo.content}`);
                }

            } catch (err: any) {
                console.error(`[${pollCount}] Poll error:`, err.message);
            }

            // Wait 5 seconds before next poll
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        console.error("❌ Job Status Check Timeout!");
        return null;

    } catch (error: any) {
        console.error("❌ Job Status Check Failed:", error.message);
        return null;
    }
}

// Test 5: Get active jobs
async function testGetActiveJobs() {
    console.log("\n=== Test 5: Get Active Jobs ===");
    try {
        const client = createClient();
        const response = await client.get("/acp/jobs/active");

        const jobs = response.data.data || [];
        console.log(`✅ Found ${jobs.length} active jobs`);

        if (jobs.length > 0) {
            jobs.forEach((job: any) => {
                console.log(`  - Job #${job.id}: ${job.phase}`);
            });
        }

        return jobs;
    } catch (error: any) {
        console.error("❌ Get Active Jobs Failed:", error.message);
        return [];
    }
}

// Main test runner
async function runTests() {
    console.log("========================================");
    console.log("  Axelrod Agent Diagnostic Test");
    console.log("========================================");
    console.log(`Agent Address: ${AXELROD_ADDRESS}`);
    console.log(`API Base URL: ${API_BASE_URL}`);

    // Run tests
    const apiOk = await testApiConnection();
    if (!apiOk) {
        console.error("\n❌ Cannot proceed - API connection failed");
        return;
    }

    const axelrod = await testGetAxelrod();
    if (!axelrod) {
        console.error("\n❌ Cannot proceed - Axelrod agent not found");
        return;
    }

    // Check if there are any active jobs
    const activeJobs = await testGetActiveJobs();

    // Ask if user wants to create a test job
    console.log("\n=== Test Options ===");
    console.log("1. Create a test swap_token job");
    console.log("2. Skip job creation");

    // For automation, we'll create a test job
    console.log("\nCreating test job...");
    const jobId = await testCreateJob();

    if (jobId) {
        console.log("\nMonitoring job status (this may take a few minutes)...");
        await testJobStatus(jobId, 120000); // 2 minutes timeout
    }

    console.log("\n========================================");
    console.log("  Test Complete");
    console.log("========================================");
}

runTests().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});
