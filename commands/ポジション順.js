const { SlashCommandBuilder } = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ポジション順')
    .setDescription('ポジション値が高い順にキャラを表示')
    .addStringOption(option =>
      option.setName('属性')
        .setDescription('属性で絞り込み（例: 青, 赤, 緑）')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('ロール')
        .setDescription('ロールで絞り込み（例: タンク, アタッカー）')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('名前')
        .setDescription('キャラクター名または略称の一部')
        .setRequired(false)
    ),

  async execute(interaction) {
    const attr = interaction.options.getString('属性');
    const role = interaction.options.getString('ロール');
    const name = interaction.options.getString('名前');

    let filtered = data.filter(c => typeof c.position === 'number');

    if (attr) {
      filtered = filtered.filter(c => c.attribute === attr);
    }

    if (role) {
      filtered = filtered.filter(c => c.role === role);
    }

    if (name) {
      const regex = new RegExp(name, 'i');
      filtered = filtered.filter(c =>
        regex.test(c.name) ||
        (c.aliases && c.aliases.some(alias => regex.test(alias)))
      );
    }

    const sorted = filtered.sort((a, b) => b.position - a.position);

    if (sorted.length === 0) {
      return interaction.reply('該当するキャラが見つかりません。');
    }

    const result = sorted.map(c => `${c.name}（${c.position}）`).join('\n');

    await interaction.reply(result.slice(0, 2000)); // Discordの文字数制限に対応
  }
};
