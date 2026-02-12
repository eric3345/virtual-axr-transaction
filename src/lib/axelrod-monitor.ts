import axios from "axios";

// =============================================================================
// Configuration - Read from OpenClaw environment variables
// =============================================================================

const DEFAULT_AXELROD_ADDRESS = "0x999A1B6033998A05F7e37e4BD471038dF46624E1" as const;
const API_BASE_URL = "https://claw-api.virtuals.io";

const DEFAULT_SWAP_PARAMS = [
    { fromSymbol: "USDC", toSymbol: "WETH", amount: 0.001 },
];

export type SwapParams = {
    fromSymbol: string;
    toSymbol: string;
    amount: number;
};

// =============================================================================
// Types
// =============================================================================

export type AgentInfo = {
    id: string;
    name: string;
    walletAddress: string;
    description: string;
    graduationStatus: string;
    onlineStatus: string;
    jobOfferings: {
        name: string;
        price: number;
        priceType: string;
        requirement: string;
    }[];
};

export type JobCreateResult = {
    jobId: number;
};

export type JobStatus = {
    jobId: number;
    phase: string;
    deliverable?: unknown;
    memoHistory?: Array<{
        nextPhase: string;
        content: string;
        createdAt: string;
        status: string;
    }>;
};

export type TransactionBatchResult = {
    success: boolean;
    completedJobs: number;
    failedJobs: number;
    results: Array<{
        index: number;
        status: string;
        result?: JobStatus;
        error?: string;
    }>;
};

// =============================================================================
// Configuration Functions (Read from OpenClaw environment variables)
// OpenClaw injects these via skills.virtual-axr-transaction.env.*
// =============================================================================

export function getApiKey(chatId: string): string {
    // Validate input
    if (!chatId || typeof chatId !== "string") {
        throw new Error(`Permission Denied: Invalid chat ID provided.`);
    }

    // 1. Try to find in multiple mappings: CHAT_API_KEY_MAP="chatId1:key1,chatId2:key2"
    const multiKeys = process.env.CHAT_API_KEY_MAP;
    if (multiKeys) {
        const mappings = multiKeys.split(",").map(m => m.trim()).filter(m => m.length > 0);
        for (const mapping of mappings) {
            const parts = mapping.split(":");
            if (parts.length < 2) continue; // Skip invalid mappings

            const [mappedChatId, apiKey] = parts;
            // Validate both chatId and apiKey are non-empty
            if (mappedChatId && apiKey && mappedChatId === chatId && apiKey.trim().length > 0) {
                return apiKey.trim();
            }
        }
    }

    // 2. Fallback to legacy single key if CHAT_ID matches
    // Security: Reject wildcard or empty CHAT_ID values
    const legacyApiKey = process.env.LITE_AGENT_API_KEY;
    const legacyChatId = process.env.CHAT_ID;

    if (legacyApiKey && legacyChatId) {
        const trimmedApiKey = legacyApiKey.trim();
        const trimmedChatId = legacyChatId.trim();

        // Reject wildcard or invalid configurations
        if (trimmedChatId === "*" || trimmedChatId === "" || trimmedApiKey === "") {
            throw new Error(`Permission Denied: Chat ID ${chatId} is not configured in the access whitelist.`);
        }

        if (trimmedChatId === chatId) {
            return trimmedApiKey;
        }
    }

    throw new Error(`Permission Denied: Chat ID ${chatId} is not configured in the access whitelist.`);
}

export function getAxelrodAddress(): string {
    return process.env.AXELROD_AGENT_ADDRESS || DEFAULT_AXELROD_ADDRESS;
}

export function getDefaultTransactionCount(): number {
    return Number(process.env.BATCH_TRANSACTION_COUNT || "10");
}

export function getSwapParams(): SwapParams[] {
    const envParams = process.env.SWAP_PARAMS;
    if (!envParams) {
        return DEFAULT_SWAP_PARAMS;
    }

    try {
        // Parse format: fromSymbol,toSymbol,amount;...
        return envParams.split(";").map((pair) => {
            const [fromSymbol, toSymbol, amount] = pair.split(",");
            return {
                fromSymbol: fromSymbol.trim(),
                toSymbol: toSymbol.trim(),
                amount: Number(amount.trim()),
            };
        });
    } catch (error) {
        console.warn(`Failed to parse SWAP_PARAMS, using defaults: ${error}`);
        return DEFAULT_SWAP_PARAMS;
    }
}

// =============================================================================
// HTTP Client
// =============================================================================

function createClient(chatId: string) {
    const apiKey = getApiKey(chatId);
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
        },
    });
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get agent information by wallet address
 * @param chatId - Telegram chat ID
 * @param agentAddress - Agent wallet address
 */
export async function getAgent(chatId: string, agentAddress: string): Promise<AgentInfo> {

    const client = createClient(chatId);

    // Try to get agent directly - the API might have a direct endpoint
    // If not, we'll need to search for it
    try {
        const response = await client.get<{ data: AgentInfo[] }>(
            `/acp/agents?query=${encodeURIComponent(agentAddress)}`
        );

        const agents = response.data.data;
        if (!agents || agents.length === 0) {
            throw new Error(`Agent not found: ${agentAddress}`);
        }

        // Find the exact match
        const agent = agents.find((a) => a.walletAddress.toLowerCase() === agentAddress.toLowerCase());
        if (!agent) {
            throw new Error(`Agent not found: ${agentAddress}`);
        }

        return agent;
    } catch (error: any) {
        throw new Error(`Failed to get agent: ${error.message}`);
    }
}

/**
 * Create a job with an agent
 */
export async function createJob(
    chatId: string,
    agentWalletAddress: string,
    jobOfferingName: string,
    serviceRequirements: Record<string, unknown>
): Promise<JobCreateResult> {
    const client = createClient(chatId);

    try {
        const response = await client.post<{ data: { jobId: number } }>("/acp/jobs", {
            providerWalletAddress: agentWalletAddress, // The agent is the job provider
            jobOfferingName,
            serviceRequirements,
        });

        return { jobId: response.data.data.jobId };
    } catch (error: any) {
        throw new Error(`Failed to create job: ${error.message}`);
    }
}

/**
 * Get job status
 */
export async function getJobStatus(chatId: string, jobId: number): Promise<JobStatus> {
    const client = createClient(chatId);

    try {
        const response = await client.get(`/acp/jobs/${jobId}`);
        const data = response.data.data;

        return {
            jobId: data.id,
            phase: data.phase,
            deliverable: data.deliverable,
            memoHistory: (data.memos || []).map((memo: any) => ({
                nextPhase: memo.nextPhase,
                content: memo.content,
                createdAt: memo.createdAt,
                status: memo.status,
            })),
        };
    } catch (error: any) {
        throw new Error(`Failed to get job status: ${error.message}`);
    }
}

/**
 * Poll job until completed
 */
export async function pollJobUntilComplete(
    chatId: string,
    jobId: number,
    maxPolls: number = 120,
    pollIntervalMs: number = 5000,
    onPollProgress?: (message: string) => void
): Promise<JobStatus> {
    let lastPhase = "unknown";

    for (let i = 0; i < maxPolls; i++) {
        const status = await getJobStatus(chatId, jobId);
        lastPhase = status.phase;

        // Debug: print current phase
        const pollMessage = `[Job #${jobId}] Current phase: ${status.phase} (${i + 1}/${maxPolls})`;
        if (i % 6 === 0) { // Print every 30 seconds
            console.log(pollMessage);
        }
        if (onPollProgress) {
            onPollProgress(pollMessage);
        }

        // Phase is uppercase in the API response
        if (status.phase === "COMPLETED") {
            return status;
        }

        if (status.phase === "REJECTED") {
            throw new Error(`Job #${jobId} was rejected`);
        }

        if (status.phase === "EXPIRED") {
            throw new Error(`Job #${jobId} expired`);
        }

        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Job #${jobId} timeout after ${maxPolls * pollIntervalMs}ms (last phase: ${lastPhase})`);
}

/**
 * Send multiple swap_token transactions with Axelrod agent
 * @param chatId - Telegram chat ID
 * @param agentAddress - Agent wallet address
 * @param transactionCount - Number of transactions to send (default: 10)
 * @param onProgress - Optional progress callback
 */
export async function sendTransactionsWithAxelrod(
    chatId: string,
    agentAddress: string,
    transactionCount: number = 10,
    onProgress?: (message: string) => void
): Promise<TransactionBatchResult> {

    const results: TransactionBatchResult["results"] = [];
    let completedJobs = 0;
    let failedJobs = 0;

    const swapParams = getSwapParams();

    if (onProgress) onProgress(`Starting transaction batch with ${transactionCount} transactions...`);

    for (let i = 0; i < transactionCount; i++) {
        try {
            const params = swapParams[i % swapParams.length];
            if (onProgress) onProgress(`[${i + 1}/${transactionCount}] Executing swap: ${params.amount} ${params.fromSymbol} -> ${params.toSymbol}`);

            // Create the job
            const { jobId } = await createJob(chatId, agentAddress, "swap_token", params);

            // Poll until completion
            const result = await pollJobUntilComplete(
                chatId,
                jobId,
                120, // maxPolls
                5000, // pollIntervalMs
                (msg) => {
                    // Forward poll progress to main progress callback
                    if (onProgress) onProgress(msg);
                }
            );

            completedJobs++;
            results.push({ index: i, status: "completed", result });

            if (onProgress) onProgress(`[${i + 1}/${transactionCount}] ✓ Completed (Job #${jobId})`);
        } catch (error: any) {
            failedJobs++;
            results.push({ index: i, status: "failed", error: error.message });
            console.error(`[${i + 1}/${transactionCount}] ✗ Failed: ${error.message}`);

            // Continue with next transaction even if current fails
        }
    }

    return {
        success: completedJobs >= transactionCount,
        completedJobs,
        failedJobs,
        results,
    };
}

