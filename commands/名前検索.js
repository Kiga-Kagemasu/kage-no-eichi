// commands/名前検索.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const data = require('../characters.json');
const { createCharacterListEmbed } = require('../utils/embedFactory');

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
      return interaction.reply('該当キャラが見つかりません。');
    }

    const page = 0;
    const embed = createCharacterListEmbed(found, page, keyword);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`prev_${keyword}_${page}`)
        .setLabel('← 前へ')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`next_${keyword}_${page}`)
        .setLabel('次へ →')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(found.length <= 10)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

