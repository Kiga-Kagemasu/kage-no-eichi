const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder
} = require('discord.js');
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
    await interaction.deferReply();

    const found = data.filter(c => {
      const allText = JSON.stringify(c.skills) + JSON.stringify(c.magitools);
      return allText.includes(keyword);
    });

    if (found.length === 0) {
      return interaction.editReply('該当効果のキャラは見つかりません。');
    }

    const components = [];
    const pageSize = 25;
    for (let i = 0; i < found.length; i += pageSize) {
      const page = found.slice(i, i + pageSize);
      const menu = new StringSelectMenuBuilder()
        .setCustomId(`select_character_page_${i / pageSize}`)
        .setPlaceholder(`キャラを選択（${i + 1}〜${i + page.length}件目）`)
        .addOptions(
          page.map(c => ({
            label: c.name.replace(/\[.\]$/, '').slice(0, 100),
            value: c.name
          }))
        );
      components.push(new ActionRowBuilder().addComponents(menu));
    }

    await interaction.editReply({
      content: '効果に該当するキャラ一覧：',
      components
    });
  }
};
