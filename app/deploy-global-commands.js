require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 環境変数チェック
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

console.log("=== 環境変数の読み取り ===");
console.log("TOKEN:", token ? "[OK]" : "[未設定]");
console.log("CLIENT_ID:", clientId || "[未設定]");

if (!token || !clientId) {
  console.error("❌ .env（Secrets）の token または CLIENT_ID が設定されていません。");
  process.exit(1);
}

// コマンド読み込み
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

// グローバルコマンド登録
(async () => {
  try {
    console.log("🌐 グローバルスラッシュコマンドを登録中…");

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log("✅ グローバルスラッシュコマンド登録完了！");
  } catch (error) {
    console.error("❌ 登録中にエラーが発生しました:", error);
  }
})();
