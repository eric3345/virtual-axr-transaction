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
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
}

// CLI handler
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        printError(new Error("Usage: npx tsx scripts/index.ts <command> [args]"));
        printError(new Error("Commands: check_status, transaction"));
        process.exit(1);
    }

    const command = args[0];

    try {
        const axelrodAddress = getAxelrodAddress();

        switch (command) {
            case "check_status": {
                console.error(`Querying Axelrod agent status...\n`);

                const agent = await getAgent(axelrodAddress);

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
                const transactionCount = args[1] ? Number(args[1]) : getDefaultTransactionCount();

                console.error(`Sending ${transactionCount} transactions with Axelrod...`);
                console.error(`This may take several minutes...\n`);

                const result = await sendTransactionsWithAxelrod(
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
