const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const characters = require('../characters.json');
const { createCharacterListEmbed } = require('../embedFactory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('名前検索')
    .setDescription('キャラ名の一部で検索します')
    .addStringOption(option =>
      option.setName('文字列')
        .setDescription('キャラ名の一部を入力')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('文字列');
    const matched = characters.filter(char =>
      char.name.includes(query) ||
      (char.aliases && char.aliases.some(alias => alias.includes(query)))
    );

    if (matched.length === 0) {
      return await interaction.reply({ content: '該当するキャラが見つかりませんでした。', ephemeral: true });
    }

    await interaction.deferReply(); // 処理中表示

    const perPage = 10;
    let page = 0;
    const maxPage = Math.ceil(matched.length / perPage) - 1;

    const getEmbed = () => {
      const sliced = matched.slice(page * perPage, (page + 1) * perPage);
      return createCharacterListEmbed(sliced, page + 1, maxPage + 1);
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('◀')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('▶')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === maxPage)
    );

    const message = await interaction.editReply({
      embeds: [getEmbed()],
      components: [row]
    });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return await i.reply({ content: 'このボタンはあなたの操作専用です。', ephemeral: true });
      }

      await i.deferUpdate();

      if (i.customId === 'prev' && page > 0) page--;
      else if (i.customId === 'next' && page < maxPage) page++;

      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === maxPage)
      );

      await i.editReply({
        embeds: [getEmbed()],
        components: [newRow]
      });
    });

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
      );

      await message.edit({ components: [disabledRow] });
    });
  }
};
