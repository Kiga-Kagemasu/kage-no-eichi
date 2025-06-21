const { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } = require('discord.js');
const data = require('./characters.json');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
  console.log(`ログイン成功：${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === '性能検索') {
    const keyword = interaction.options.getString('効果');
    const found = data.filter(c => {
      const allText = JSON.stringify(c.skills) + JSON.stringify(c.magitools);
      return allText.includes(keyword);
    });

    if (found.length === 0) {
      await interaction.reply('該当効果のキャラは見つかりません。');
    } else {
      await interaction.reply(found.map(c => c.name).join('\n'));
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
