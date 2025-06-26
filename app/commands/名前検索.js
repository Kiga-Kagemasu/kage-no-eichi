const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder
} = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('名前検索')
    .setDescription('キャラ名や別名から選択して性能を確認します')
    .addStringOption(option =>
      option.setName('キーワード')
        .setDescription('キャラクター名または略称')
        .setRequired(true)
    ),

  async execute(interaction) {
    const keyword = interaction.options.getString('キーワード');
    const regex = new RegExp(keyword, 'i');

    await interaction.deferReply();

    const matched = data.filter(c =>
      regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
    );

    const uniqueMap = new Map();
    for (const c of matched) {
      if (!uniqueMap.has(c.name)) {
        uniqueMap.set(c.name, c);
      }
    }

    const results = Array.from(uniqueMap.values());
    if (results.length === 0) {
      return interaction.editReply('該当キャラが見つかりませんでした。');
    }

    const components = [];
    const pageSize = 25;
    for (let i = 0; i < results.length; i += pageSize) {
      const page = results.slice(i, i + pageSize);
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
      content: 'キャラを選んでください：',
      components
    });
  }
};
