const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// コマンド読み込み
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Bot起動時
client.once('ready', () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
});

// コマンド実行時の処理
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ コマンド実行時にエラー:`, error);
    await interaction.reply({
      content: 'コマンド実行時にエラーが発生しました。',
      ephemeral: true
    });
  }
});

// .envのDISCORD_TOKENを使用
client.login(process.env.DISCORD_TOKEN);
