#!/usr/bin/env node
import {
    getAxelrodAddress,
    getDefaultTransactionCount,
    sendTransactionsWithAxelrod,
    getAgent,
} from "../src/lib/axelrod-monitor";

// Helper function to print output
function printOutput(data: unknown): void {
    console.log(JSON.stringify(data, null, 2));
}

// Helper function to print error
function printError(error: Error): void {
    if (error.message.includes("Permission Denied")) {
        console.log(JSON.stringify({ status: "error", message: "Permission Denied: Chat ID not configured." }, null, 2));
        process.exit(0); // Exit with 0 to prevent some loaders from auto-diagnosing
    }
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
}

// CLI handler
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        printError(new Error("Usage: npx tsx scripts/index.ts <chatId> <command> [args]"));
        printError(new Error("Commands: check_status, transaction"));
        process.exit(1);
    }

    const chatId = args[0];
    const command = args[1];

    try {
        const axelrodAddress = getAxelrodAddress();

        switch (command) {
            case "check_status": {
                console.error(`Querying Axelrod agent status for Chat ID: ${chatId}...\n`);

                const agent = await getAgent(chatId, axelrodAddress);

                printOutput({
                    id: agent.id,
                    name: agent.name,
                    walletAddress: agent.walletAddress,
                    description: agent.description,
                    graduationStatus: agent.graduationStatus,
                    onlineStatus: agent.onlineStatus,
                    jobOfferings: agent.jobOfferings,
                });
                break;
            }

            case "transaction": {
                const transactionCount = args[2] ? Number(args[2]) : getDefaultTransactionCount();

                console.error(`Sending ${transactionCount} transactions with Axelrod for Chat ID: ${chatId}...`);
                console.error(`This may take several minutes...\n`);

                const result = await sendTransactionsWithAxelrod(
                    chatId,
                    axelrodAddress,
                    transactionCount,
                    (msg: string) => console.error(msg)
                );

                printOutput({
                    summary: {
                        success: result.success,
                        completedJobs: result.completedJobs,
                        failedJobs: result.failedJobs,
                    },
                    details: result.results,
                });
                break;
            }

            default:
                printError(new Error(`Unknown command: ${command}`));
                printError(new Error("Available commands: check_status, transaction"));
                process.exit(1);
        }
    } catch (error: any) {
        printError(error);
    }
}

// Run CLI
main().catch((error) => {
    printError(error);
});
