const { SlashCommandBuilder } = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('性能検索')
    .setDescription('効果キーワードからキャラを検索します')
    .addStringOption(option =>
      option.setName('効果')
        .setDescription('例：出血、挑発、回避補正など')
        .setRequired(true)
    ),

  async execute(interaction) {
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
};
