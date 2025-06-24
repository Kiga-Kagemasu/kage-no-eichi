const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const token = process.env.DISCORD_TOKEN;

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error('❌ コマンド実行時エラー:', err);
      const msg = 'コマンド実行中にエラーが発生しました。';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: msg, ephemeral: true });
      } else {
        await interaction.reply({ content: msg, ephemeral: true });
      }
    }
  }

  // ❌ StringSelectMenu の処理は不要：名前検索.jsに内包済み
});

client.login(token);
