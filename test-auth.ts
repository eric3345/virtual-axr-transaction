import { getApiKey } from "./src/lib/axelrod-monitor";

// 模拟环境变量
process.env.CHAT_API_KEY_MAP = "-5186856333:acp-2039a69042438cd5cf2f";

console.log("🧪 白名单验证测试\n");

// 测试未授权的 chatId
const unauthorizedChatId = "-5225240692";
console.log(`测试 chatId: ${unauthorizedChatId}`);

try {
    const key = getApiKey(unauthorizedChatId);
    console.log(`❌ 白名单失效！返回了 key: ${key}`);
} catch (error: any) {
    console.log(`✅ 白名单生效: ${error.message}`);
}

// 测试授权的 chatId
console.log(`\n测试授权的 chatId: -5186856333`);
try {
    const key = getApiKey("-5186856333");
    console.log(`✅ 授权成功: ${key.substring(0, 15)}...`);
} catch (error: any) {
    console.log(`❌ 意外错误: ${error.message}`);
}
