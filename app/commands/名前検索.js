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

    let replied = false;
    try {
      await interaction.deferReply({ ephemeral: false });
      replied = true;
    } catch (err) {
      console.error('❌ deferReply失敗:', err);
      return;
    }

    try {
      const matched = data.filter(c =>
        regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
      );

      const uniqueMap = new Map();
      for (const c of matched) {
        if (!uniqueMap.has(c.name)) {
          uniqueMap.set(c.name, c);
        }
      }

      const limited = Array.from(uniqueMap.values()).slice(0, 25);
      if (limited.length === 0) {
        return await interaction.editReply('該当キャラが見つかりませんでした。');
      }

      const menu = new StringSelectMenuBuilder()
        .setCustomId('select_character')
        .setPlaceholder('キャラを選択してください')
        .addOptions(limited.map(c => ({
          label: c.name.replace(/\[.\]$/, '').slice(0, 100),
          value: c.name
        })));

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.editReply({
        content: 'キャラを選んでください：',
        components: [row]
      });

    } catch (err) {
      console.error('❌ 名前検索中にエラー:', err);
      if (replied) {
        try {
          await interaction.editReply({ content: 'エラーが発生しました。' });
        } catch (err2) {
          console.error('❌ editReplyも失敗:', err2);
        }
      } else {
        try {
          await interaction.reply({
            content: 'エラーが発生しました。',
            flags: 64
          });
        } catch (err3) {
          console.error('❌ replyも失敗:', err3);
        }
      }
    }
  }
};
