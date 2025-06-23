const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
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
    const results = data.filter(c =>
      regex.test(c.name) || (c.aliases || []).some(a => regex.test(a))
    );

    if (results.length === 0) {
      return await interaction.reply({
        content: '該当キャラが見つかりません。',
        ephemeral: true
      });
    }

    const pageSize = 10;
    const totalPages = Math.ceil(results.length / pageSize);
    let currentPage = 0;

    const createEmbed = (page) => {
      const start = page * pageSize;
      const sliced = results.slice(start, start + pageSize);
      const description = sliced.map((c, i) => `${start + i + 1}. ${c.name}`).join('\n');

      return new EmbedBuilder()
        .setTitle(`🔍 名前に「${keyword}」を含むキャラ一覧`)
        .setDescription(description || '該当キャラなし')
        .setFooter({ text: `ページ ${page + 1} / ${totalPages}` })
        .setColor(0x888888);
    };

    const createButtons = (page) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('← 前へ')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('次へ →')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= totalPages - 1),
        new ButtonBuilder()
          .setCustomId('jump')
          .setLabel('性能を見る')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(results.length > 50) // 50件以上なら非表示
      );
    };

    const message = await interaction.reply({
      embeds: [createEmbed(currentPage)],
      components: [createButtons(currentPage)],
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return await i.reply({ content: 'これはあなた専用の操作です。', ephemeral: true });
      }

      const id = i.customId;

      if (id === 'prev' && currentPage > 0) currentPage--;
      if (id === 'next' && currentPage < totalPages - 1) currentPage--;

      if (id === 'jump') {
        const start = currentPage * pageSize;
        const sliced = results.slice(start, start + pageSize);
        const names = sliced.map(c => c.name).join('、');

        return await i.update({
          content: `以下のキャラ名で \`/キャラ検索\` を使って性能を確認してください：\n\`\`\`${names}\`\`\``,
          embeds: [],
          components: []
        });
      }

      await i.update({
        embeds: [createEmbed(currentPage)],
        components: [createButtons(currentPage)]
      });
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch (e) {}
    });
  }
};
