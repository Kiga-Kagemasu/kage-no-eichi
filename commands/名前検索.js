const { SlashCommandBuilder } = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('名前検索')
    .setDescription('名前の一部からキャラ一覧を検索')
    .addStringOption(option =>
      option.setName('キーワード')
        .setDescription('例：アルファ、ガンマなど')
        .setRequired(true)
    ),

  async execute(interaction) {
    const keyword = interaction.options.getString('キーワード');
    const regex = new RegExp(keyword, 'i');
    const found = data.filter(c => regex.test(c.name));

    if (found.length === 0) {
      await interaction.reply('該当キャラが見つかりません。');
    } else {
      await interaction.reply(found.map(c => c.name).join('\n'));
    }
  }
};
