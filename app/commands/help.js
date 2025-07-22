const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7_help')
    .setDescription('コマンド一覧と使い方'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('コマンド 使い方')
      .setDescription('各コマンドを紹介します。') 
      .setColor(0x00BFFF)
      .addFields(
        {
          name: '/1_キャラ検索',
          value: '正式名称・通称(登録されている名前)で検索可能(例：イプべ、イプベタなど)\n\u200B',
        },
        {
          name: '/2_名前検索',
          value: '正式名称・通称の「部分一致」で検索＆性能表示(「アルファ」、「私服」、「の」など)\n\u200B',
        },
        {
          name: '/3_性能検索',
          value: '奥義/特技/特殊/魔道具などに含まれる効果の「部分一致」で検索＆性能表示(「出血」、「防御」、「さらに」など)\n\u200B',
        },
        {
          name: '/4_絞り込み',
          value: '属性、ロール条件で検索＆性能表示\n\u200B',
        },
        {
          name: '/5_ポジション順',
          value: 'ポジション値で降順に表示\n\u200B',
        },
        {
          name: '/6_スコア計算',
          value: 'ギルイベの与ダメ・ボスのHP・ボーナス・スコアをどれか1つを算出\n\u200B',
        },
        {
          name: '/8_フィードバック',
          value: 'botの不具合やミス、要望など、匿名で送信\n\u200B',
        }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
