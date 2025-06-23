const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const data = require('../characters.json');
const { generatePaginatedEmbeds } = require('../utils/embedFactory');

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
    const results = data.filter(c => regex.test(c.name) || (c.aliases || []).some(a => regex.test(a)));

    if (results.length === 0) {
      return interaction.reply('該当キャラが見つかりません。');
    }

    const embeds = generatePaginatedEmbeds(results);
    let currentPage = 0;

    const getButtons = (index) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`prev_${index}`)
          .setLabel('前へ')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index === 0),
        new ButtonBuilder()
          .setCustomId(`next_${index}`)
          .setLabel('次へ')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(index >= embeds.length - 1),
        new ButtonBuilder()
          .setCustomId(`jump_${index}`)
          .setLabel('性能を見る')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(results.length > 10) // 10件以下なら有効
      );
    };

    const message = await interaction.reply({
      embeds: [embeds[currentPage]],
      components: [getButtons(currentPage)],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({ time: 60_000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'これはあなたの操作専用です。', ephemeral: true });
      }

      const [action] = i.customId.split('_');

      if (action === 'prev') currentPage--;
      else if (action === 'next') currentPage++;
      else if (action === 'jump') {
        const names = results.map(c => c.name).join('、');
        await i.update({
          content: `/キャラ検索 で以下の名前を指定してください：\n\`\`\`${names}\`\`\``,
          embeds: [],
          components: [],
        });
        return;
      }

      await i.update({
        embeds: [embeds[currentPage]],
        components: [getButtons(currentPage)],
      });
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch (e) { }
    });
  }
};
