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
    try {
      const query = interaction.options.getString('文字列');
      const matched = characters.filter(char =>
        char.name.includes(query) ||
        (char.aliases && char.aliases.some(alias => alias.includes(query)))
      );

      if (matched.length === 0) {
        await interaction.reply({
          content: '該当するキャラが見つかりませんでした。',
          flags: 64 // ephemeral（非公開）
        });
        return;
      }

      await interaction.deferReply(); // ✅ 必ず最初に deferReply()

      const perPage = 10;
      let page = 0;
      const maxPage = Math.ceil(matched.length / perPage) - 1;

      const getEmbed = () => {
        const sliced = matched.slice(page * perPage, (page + 1) * perPage);
        return createCharacterListEmbed(sliced, page + 1, maxPage + 1);
      };

      const row = () =>
        new ActionRowBuilder().addComponents(
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
        components: [row()]
      });

      const collector = message.createMessageComponentCollector({ time: 60000 });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return await i.reply({
            content: 'このボタンはあなた専用です。',
            flags: 64
          });
        }

        await i.deferUpdate();

        if (i.customId === 'prev' && page > 0) page--;
        else if (i.customId === 'next' && page < maxPage) page++;

        await i.editReply({
          embeds: [getEmbed()],
          components: [row()]
        });
      });

      collector.on('end', async () => {
        try {
          await message.edit({
            components: [row()] // 同じrowでもdisabledになってる
          });
        } catch (e) {
          console.error('編集後に終了する際のエラー:', e);
        }
      });
    } catch (error) {
      console.error('❌ コマンド実行時エラー:', error);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({
            content: 'コマンド実行中にエラーが発生しました。',
            flags: 64
          });
        } else {
          await interaction.reply({
            content: 'コマンド実行中にエラーが発生しました。',
            flags: 64
          });
        }
      } catch (err) {
        console.error('❌ エラーメッセージの送信に失敗:', err);
      }
    }
  }
};
