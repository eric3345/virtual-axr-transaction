import { getApiKey } from "./src/lib/axelrod-monitor";

console.log("🧪 Testing White list Logic\n");

// Test cases
const testCases = [
    { chatId: "123456789", desc: "不在白名单的 chatId" },
    { chatId: "", desc: "空字符串 chatId" },
    { chatId: "*", desc: "通配符 chatId" },
];

for (const testCase of testCases) {
    console.log(`\n测试: ${testCase.desc}`);
    console.log(`chatId: "${testCase.chatId}"`);
    try {
        const key = getApiKey(testCase.chatId);
        console.log(`❌ FAIL - 应该被拒绝但返回了: ${key.substring(0, 10)}...`);
    } catch (error: any) {
        if (error.message.includes("Permission Denied")) {
            console.log(`✅ PASS - 正确拒绝: ${error.message}`);
        } else {
            console.log(`⚠️  其他错误: ${error.message}`);
        }
    }
}

console.log("\n测试完成");
