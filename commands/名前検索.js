const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const characters = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('名前検索')
    .setDescription('キャラ名の一部で検索し、性能に飛べます')
    .addStringOption(option =>
      option.setName('名前')
        .setDescription('検索するキャラ名の一部')
        .setRequired(true)),
  async execute(interaction) {
    const input = interaction.options.getString('名前');
    const matchedCharacters = characters.filter(char =>
      char.name.includes(input) || (char.aliases && char.aliases.some(alias => alias.includes(input)))
    );

    if (matchedCharacters.length === 0) {
      return interaction.reply({ content: '一致するキャラが見つかりませんでした。', ephemeral: true });
    }

    if (matchedCharacters.length === 1) {
      // 1件なら即Embed
      const { generateCharacterEmbed } = require('../embedFactory.js');
      const embed = generateCharacterEmbed(matchedCharacters[0]);
      return interaction.reply({ embeds: [embed] });
    }

    // 複数ヒットした場合は選択肢を出す
    const options = matchedCharacters.slice(0, 25).map(char => ({
      label: char.name,
      value: char.id || char.name
    }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_character_detail')
        .setPlaceholder('性能を確認したいキャラを選んでください')
        .addOptions(options)
    );

    const embed = new EmbedBuilder()
      .setTitle('キャラ検索結果')
      .setDescription(matchedCharacters.map(c => `- ${c.name}`).join('\n'))
      .setColor(0x00bfff);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
