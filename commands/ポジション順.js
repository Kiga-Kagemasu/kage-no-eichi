const { SlashCommandBuilder } = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ポジション順')
    .setDescription('ポジション値が高い順にキャラを表示'),

  async execute(interaction) {
    const sorted = data
      .filter(c => typeof c.position === 'number')
      .sort((a, b) => b.position - a.position);

    const result = sorted.map(c => `${c.name}（${c.position}）`).join('\n');

    await interaction.reply(result.slice(0, 2000)); // Discord文字数制限対策
  }
};
