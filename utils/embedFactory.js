const { EmbedBuilder } = require('discord.js');

function createCharacterListEmbed(characters, page = 0, keyword = '') {
  const pageSize = 10;
  const start = page * pageSize;
  const end = start + pageSize;
  const total = characters.length;
  const totalPages = Math.ceil(total / pageSize);

  const sliced = characters.slice(start, end);
  const list = sliced.map((c, i) => `${start + i + 1}. ${c.name}`).join('\n') || '該当キャラなし';

  const embed = new EmbedBuilder()
    .setTitle(`🔍 名前に「${keyword}」を含むキャラ一覧`)
    .setDescription(list)
    .setFooter({ text: `ページ ${page + 1} / ${totalPages}` })
    .setColor(0x888888);

  return embed;
}

module.exports = { createCharacterListEmbed };


// 📁 commands/名前検索.js
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
      return await interaction.reply('該当キャラが見つかりません。');
    }

    const embed = createCharacterListEmbed(found, 0, keyword);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`name_prev_0_${keyword}`)
        .setLabel('← 前へ')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId(`name_next_0_${keyword}`)
        .setLabel('次へ →')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(found.length <= 10)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
