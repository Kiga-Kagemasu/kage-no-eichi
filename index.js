const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { generateCharacterEmbed } = require('./embedFactory.js');
const characters = require('./characters.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
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
    } catch (error) {
      console.error('❌ コマンド実行時にエラー:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
      } else {
        await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
      }
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'select_character_detail') {
      const selectedId = interaction.values[0];
      const char = characters.find(c => c.id === selectedId || c.name === selectedId);
      if (!char) return interaction.reply({ content: 'キャラが見つかりませんでした。', ephemeral: true });

      const embed = generateCharacterEmbed(char);
      await interaction.update({ embeds: [embed], components: [] });
    }
  }
});

client.login(token);
