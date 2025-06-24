const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder
} = require('discord.js');
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
      // ⚠️ エラーハンドリングも最初に！応答がない場合のみ reply()
      if (!interaction.deferred && !interaction.replied) {
        return interaction.reply({ content: '該当キャラが見つかりません。', ephemeral: true });
      }
      return;
    }

    try {
      // ✅ すぐに deferReply（インタラクションを確保する）
      await interaction.deferReply({ ephemeral: false });

      const limited = matched.slice(0, 25);
      const menu = new StringSelectMenuBuilder()
        .setCustomId('select_character')
        .setPlaceholder('キャラを選択してください')
        .addOptions(limited.map(c => ({
          label: c.name.slice(0, 100),
          value: c.id
        })));

      const row = new ActionRowBuilder().addComponents(menu);

      // ✅ 編集で応答（deferした後なので editReply を使う）
      await interaction.editReply({
        content: 'キャラクターを選択してください：',
        components: [row]
      });

    } catch (err) {
      console.error('❌ 名前検索中にエラー:', err);
      // ❗ すでにdeferReply済みなので、editReplyでエラー通知（replyしない！）
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({ content: 'エラーが発生しました。' });
      }
    }
  }
};
