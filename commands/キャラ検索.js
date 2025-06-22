const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const data = require('../characters.json');

const attributeColors = {
  赤: 0xFF0000,
  青: 0x0000FF,
  黄: 0xFFFF00,
  緑: 0x00FF00
};

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
    const embed = new EmbedBuilder()
      .setTitle(char.name)
      .setColor(attributeColors[char.attribute] || 0x999999)
      .setThumbnail(char.image)
      .addFields(
        { name: '属性 / ロール / ポジション', value: `${char.attribute} / ${char.role} / ${char.position}`, inline: false },
        { name: '魔力覚醒順', value: char.awakening_order.join(' → '), inline: false }
      );

    // スキル整形
    for (const [key, value] of Object.entries(char.skills || {})) {
      embed.addFields({
        name: key,
        value:
          `【通常】${value.base}\n` +
          `**【覚醒】${value.awakened}**`,
        inline: false
      });
    }

    // 特殊項目
    if (char.combo) {
      embed.addFields({ name: 'コンボ', value: char.combo, inline: false });
    }
    if (char.group) {
      embed.addFields({ name: 'グループ', value: char.group.join('、'), inline: false });
    }
    if (char.magitools) {
      const tools = Object.entries(char.magitools).map(([key, tool]) =>
        `【${tool.name}】${tool.effect}`
      ).join('\n');
      embed.addFields({ name: '魔道具', value: tools, inline: false });
    }

    return interaction.reply({ embeds: [embed] });
  }
};
