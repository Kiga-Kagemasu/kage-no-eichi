const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
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

    const matched = data.filter(c =>
      regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
    );

    if (matched.length === 0) {
      return interaction.reply({ content: '該当キャラが見つかりません。', ephemeral: true });
    }

    const limited = matched.slice(0, 25); // 最大25件
    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_character')
      .setPlaceholder('キャラを選択してください')
      .addOptions(limited.map(c => ({
        label: c.name.slice(0, 100),
        value: c.id
      })));

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: 'キャラクターを選択してください：',
      components: [row], // ✨ visible to all
      ephemeral: false   // ✨ 全員に見せる
    });
  }
};
