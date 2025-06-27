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
    .setName('4_絞り込み')
    .setDescription('属性・ロールでキャラを絞り込み')
    .addStringOption(option =>
      option.setName('属性')
        .setDescription('属性を選択（任意）')
        .setRequired(false)
        .addChoices(
          { name: '赤', value: '赤' },
          { name: '緑', value: '緑' },
          { name: '黄', value: '黄' },
          { name: '青', value: '青' }
        )
    )
    .addStringOption(option =>
      option.setName('ロール')
        .setDescription('ロールを選択（任意）')
        .setRequired(false)
        .addChoices(
          { name: 'タンク', value: 'タンク' },
          { name: 'アタッカー', value: 'アタッカー' },
          { name: 'サポーター', value: 'サポーター' }
        )
    ),

  async execute(interaction) {
    const attr = interaction.options.getString('属性');
    const role = interaction.options.getString('ロール');

    const matched = data.filter(c => {
      if (attr && c.attribute !== attr) return false;
      if (role && c.role !== role) return false;
      return true;
    });

    if (matched.length === 0) {
      return await interaction.reply({ content: '該当キャラが見つかりません。', ephemeral: true });
    }

    const chunked = [];
    for (let i = 0; i < matched.length; i += 25) {
      chunked.push(matched.slice(i, i + 25));
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

    const message = await interaction.reply({
      content: `該当キャラ（${matched.length}件中 ${currentPage + 1}/${chunked.length}ページ）：`,
      components: [getSelectRow(currentPage), getNavRow(currentPage)],
      ephemeral: false,
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
          content: `該当キャラ（${matched.length}件中 ${currentPage + 1}/${chunked.length}ページ）：`,
          components: [getSelectRow(currentPage), getNavRow(currentPage)]
        });
      } catch (err) {
        console.error('❌ ページ切替失敗:', err);
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
