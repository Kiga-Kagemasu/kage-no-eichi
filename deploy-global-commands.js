require('dotenv').config();

console.log("TOKEN:", process.env.token);
console.log("CLIENT_ID:", process.env.CLIENT_ID);

if (!process.env.token || !process.env.CLIENT_ID) {
  console.error("❌ token または CLIENT_ID が undefined です。");
  process.exit(1); // 強制終了
}

const { REST, Routes } = require('discord.js');
const { token, CLIENT_ID } = process.env;
const fs = require('fs');
const path = require('path');

// コマンド読み込み
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

// Discordにグローバル登録
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🌐 グローバルスラッシュコマンドを登録中...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('✅ グローバルコマンドの登録が完了しました！');
    console.log('⚠ 最大で1時間ほど反映にかかることがあります。');
  } catch (error) {
    console.error('❌ 登録に失敗しました:', error);
  }
})();
