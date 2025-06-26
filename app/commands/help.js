const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('コマンド一覧と使い方'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('コマンド一覧')
      .setDescription('各カテゴリごとにBotのコマンドを紹介します。')
      .setColor(0x00BFFF) // 色
      .addFields(
        {
          name: 'コマンド一覧',
          value:
            '`/キャラ検索` - 正式名称・通称(登録されている名前)で検索可能(例：イプべ、イプベタなど)\n' +
            '`/名前検索` - 正式名称・通称の「部分一致」で検索＆性能表示(「アルファ」、「私服」、「の」など)\n' +
            '`/性能検索` - 奥義/特技/特殊/魔道具などに含まれる効果の「部分一致」で検索＆性能表示(「出血」、「防御」、「さらに」など)\n' +
            '`/ポジション順` - ポジション値で降順に表示\n' +
            '`/絞り込み` - 属性、ロール条件で検索＆性能表示',
        }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true }); // 自分だけに表示
  }
};
