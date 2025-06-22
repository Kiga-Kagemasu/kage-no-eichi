const { SlashCommandBuilder } = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('キャラ検索')
    .setDescription('キャラクター名から性能を検索します')
    .addStringOption(option =>
      option.setName('名前')
        .setDescription('キャラクター名または略称')
        .setRequired(true)
    ),

  async execute(interaction) {
    const keyword = interaction.options.getString('名前');
    const regex = new RegExp(keyword, 'i');
    const found = data.filter(c =>
      regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
    );

    if (found.length === 0) {
      return interaction.reply('該当キャラが見つかりません。');
    }

    if (found.length > 1) {
      return interaction.reply(found.map(c => c.name).join('\n'));
    }

    const char = found[0];

    const skillText = char.skills
      ? Object.entries(char.skills).map(([key, val]) =>
          `\n- ${key}: ${val.name}`
        ).join('')
      : 'なし';

    const magitoolText = char.magitools
      ? Object.entries(char.magitools).map(([key, val]) =>
          `\n- ${key}: ${val.name}`
        ).join('')
      : 'なし';

    const description = `**${char.name}**
属性: ${char.attribute} / ロール: ${char.role} / ポジション: ${char.position}
スキル:${skillText}
魔道具:${magitoolText}
`;

    return interaction.reply(description);
  }
};

