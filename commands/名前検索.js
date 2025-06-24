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
    try {
      const keyword = interaction.options.getString('キーワード');
      const regex = new RegExp(keyword, 'i');

      // deferは最初に入れてタイムアウト防止（reply前提で後出ししない）
      await interaction.deferReply({ ephemeral: false });

      const matched = data.filter(c =>
        regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
      );

      // 同一IDのキャラは1件のみ選択肢に（タッグ2体 → 1件）
      const uniqueMap = new Map();
      for (const char of matched) {
        if (!uniqueMap.has(char.id)) {
          uniqueMap.set(char.id, char);
        }
      }

      const limited = Array.from(uniqueMap.values()).slice(0, 25);

      if (limited.length === 0) {
        return await interaction.editReply('該当キャラが見つかりませんでした。');
      }

      const options = limited.map(c => ({
        label: c.name.replace(/\[.\]$/, '').slice(0, 100), // シャドロラ[L]/[R] → シャドロラ
        value: c.id
      }));

      const menu = new StringSelectMenuBuilder()
        .setCustomId('select_character')
        .setPlaceholder('キャラを選択してください')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.editReply({
        content: 'キャラを選んでください：',
        components: [row]
      });

    } catch (err) {
      console.error('❌ 名前検索中にエラー:', err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'エラーが発生しました。',
            ephemeral: true
          });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({
            content: 'エラーが発生しました。'
          });
        }
      } catch (err2) {
        console.error('❌ エラーレスポンス失敗:', err2);
      }
    }
  }
};
