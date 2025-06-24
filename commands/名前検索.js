const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
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

      const matched = data.filter(c =>
        regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
      );

      if (matched.length === 0) {
        await interaction.reply({ content: '該当キャラが見つかりません。', ephemeral: true });
        return;
      }

      const limited = matched.slice(0, 25); // 最大25件
      const menu = new StringSelectMenuBuilder()
        .setCustomId('select_character')
        .setPlaceholder('キャラを選択してください')
        .addOptions(limited.map(c => ({
          label: c.name.slice(0, 100),
          value: c.id
        })));

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        content: 'キャラクターを選択してください：',
        components: [row],
        ephemeral: false
      });

    } catch (err) {
      console.error('❌ 名前検索中にエラー:', err);

      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
        } catch (e) {
          console.error('❌ エラーレスポンス失敗:', e);
        }
      }
    }
  }
};
