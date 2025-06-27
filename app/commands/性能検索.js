const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('3_性能検索')
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

    const pageSize = 25;
    const chunked = [];
    for (let i = 0; i < found.length; i += pageSize) {
      chunked.push(found.slice(i, i + pageSize));
    }

    let currentPage = 0;

    const getSelectRow = (page) => {
      const menu = new StringSelectMenuBuilder()
        .setCustomId('select_character')
        .setPlaceholder('キャラを選択してください')
        .addOptions(chunked[page].map(c => ({
          label: c.name.replace(/\[.\]$/, '').slice(0, 100),
          value: c.name
        })));
      return new ActionRowBuilder().addComponents(menu);
    };

    const getNavRow = (page) => {
      const prev = new ButtonBuilder()
        .setCustomId('prev_page')
        .setLabel('← 前へ')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0);

      const next = new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('次へ →')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === chunked.length - 1);

      return new ActionRowBuilder().addComponents(prev, next);
    };

    const message = await interaction.editReply({
      content: `効果に該当するキャラ（${found.length}件中 ${currentPage + 1}/${chunked.length}ページ）：`,
      components: [getSelectRow(currentPage), getNavRow(currentPage)],
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'これはあなた専用の操作です。', ephemeral: true });
      }

      if (i.customId === 'prev_page') currentPage--;
      else if (i.customId === 'next_page') currentPage++;

      try {
        await i.update({
          content: `効果に該当するキャラ（${found.length}件中 ${currentPage + 1}/${chunked.length}ページ）：`,
          components: [getSelectRow(currentPage), getNavRow(currentPage)]
        });
      } catch (err) {
        console.error('❌ ページ更新失敗:', err);
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch (e) {
        console.error('❌ コンポーネント削除失敗:', e);
      }
    });
  }
};
