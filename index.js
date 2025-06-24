const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const characters = require('./characters.json');
const { generateCharacterEmbed } = require('./embedFactory');

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
  try {
    // スラッシュコマンド
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction);
    }

    // セレクトメニュー
    else if (interaction.isStringSelectMenu() && interaction.customId === 'select_character') {
      const charId = interaction.values[0];
      const character = characters.find(c => c.id === charId || c.name === charId);
      if (!character) {
        await interaction.reply({
          content: 'キャラが見つかりません。',
          ephemeral: true
        });
        return;
      }

      const embed = generateCharacterEmbed(character);
      await interaction.update({ embeds: [embed], components: [] });
    }
  } catch (err) {
    console.error('❌ コマンド実行時エラー:', err);
    try {
      await interaction.followUp({
        content: 'コマンド実行中にエラーが発生しました。',
        ephemeral: true
      });
    } catch (err2) {
      console.error('❌ エラーレスポンス失敗:', err2);
    }
  }
});

client.login(token);
