const { SlashCommandBuilder } = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('絞り込み')
    .setDescription('属性・ロールでキャラを絞り込み')
    .addStringOption(option =>
      option.setName('属性')
        .setDescription('例：赤、青、緑など')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('ロール')
        .setDescription('例：タンク、アタッカー、サポーターなど')
        .setRequired(true)
    ),

  async execute(interaction) {
    const attr = interaction.options.getString('属性');
    const role = interaction.options.getString('ロール');

    const found = data.filter(c =>
      c.attribute.includes(attr) && c.role.includes(role)
    );

    if (found.length === 0) {
      await interaction.reply('該当キャラが見つかりません。');
    } else {
      await interaction.reply(found.map(c => c.name).join('\n'));
    }
  }
};
