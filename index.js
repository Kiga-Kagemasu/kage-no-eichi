const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const characters = require('./characters.json');
const { generateCharacterEmbed } = require('./embedFactory');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

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

  // ▼選択メニュー応答処理（15秒内に返す必要あり）
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_character') {
    const charId = interaction.values[0];
    const character = characters.find(c => c.id === charId || c.name === charId);
    if (!character) return interaction.reply({ content: 'キャラが見つかりません。', ephemeral: true });

    const embed = generateCharacterEmbed(character);
    await interaction.update({ embeds: [embed], components: [] });
  }
});

client.login(token);
