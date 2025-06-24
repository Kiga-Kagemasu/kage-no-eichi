const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const characters = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('名前検索')
    .setDescription('キャラ名の一部で検索し、性能にジャンプ')
    .addStringOption(option =>
      option.setName('名前')
        .setDescription('検索ワード（例: ベータ）')
        .setRequired(true)),
  async execute(interaction) {
    const input = interaction.options.getString('名前');

    const matched = characters.filter(c =>
      c.name.includes(input) || (c.aliases || []).some(alias => alias.includes(input))
    );

    if (matched.length === 0) {
      return interaction.reply({ content: '一致するキャラが見つかりません。', ephemeral: true });
    }

    if (matched.length === 1) {
      const { generateCharacterEmbed } = require('../embedFactory');
      const embed = generateCharacterEmbed(matched[0]);
      return interaction.reply({ embeds: [embed] });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_character')
      .setPlaceholder('性能を表示するキャラを選択')
      .addOptions(matched.slice(0, 25).map(char => ({
        label: char.name,
        value: char.id || char.name
      })));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('キャラ検索結果')
      .setDescription('候補を選んでください')
      .setColor(0x00bfff);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
