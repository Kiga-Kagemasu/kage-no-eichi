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
    .setName('2.名前検索')
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

    const uniqueMap = new Map();
    for (const c of matched) {
      if (!uniqueMap.has(c.name)) {
        uniqueMap.set(c.name, c);
      }
    }

    const all = Array.from(uniqueMap.values());
    if (all.length === 0) {
      return await interaction.reply({ content: '該当キャラが見つかりませんでした。', ephemeral: true });
    }

    const chunked = [];
    for (let i = 0; i < all.length; i += 25) {
      chunked.push(all.slice(i, i + 25));
    }

    let currentPage = 0;
    const getRow = (page) => {
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

    let message;
    try {
      message = await interaction.reply({
        content: `キャラを選んでください（${all.length}件中 ${currentPage + 1}/${chunked.length}ページ）：`,
        components: [getRow(currentPage), getNavRow(currentPage)],
        ephemeral: false,
        fetchReply: true
      });
    } catch (err) {
      console.error('❌ 初期表示失敗:', err);
      return;
    }

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'これはあなたの操作用です。', ephemeral: true });
      }

      if (i.customId === 'prev_page') currentPage--;
      else if (i.customId === 'next_page') currentPage++;

      try {
        await i.update({
          content: `キャラを選んでください（${all.length}件中 ${currentPage + 1}/${chunked.length}ページ）：`,
          components: [getRow(currentPage), getNavRow(currentPage)]
        });
      } catch (err) {
        console.error('❌ ページ切り替え失敗:', err);
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
