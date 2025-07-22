const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const data = require('../characters.json');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalize(str) {
  return str.normalize('NFKC');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('1_キャラ検索')
    .setDescription('キャラクター名から性能を検索します')
    .addStringOption(option =>
      option.setName('名前')
        .setDescription('キャラクター名または略称')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply(); 

    const keyword = normalize(interaction.options.getString('名前'));
    const regex = new RegExp(escapeRegex(keyword), 'i');

    const matched = data.filter(c => {
      const nameNorm = normalize(c.name);
      const aliasNorms = (c.aliases || []).map(a => normalize(a));
      return (
        nameNorm === keyword ||
        aliasNorms.includes(keyword) ||
        regex.test(nameNorm) ||
        aliasNorms.some(a => regex.test(a))
      );
    });

    if (matched.length === 0) {
      return interaction.editReply('該当キャラが見つかりません。');
    }

    const embeds = [];

    for (const char of matched) {
      const isTag = char.group?.includes("タッグ");
      const isLeft = /\[L\]/.test(char.name);
      const isRight = /\[R\]/.test(char.name);
      const showOnlyOne = isLeft || isRight;

      if (embeds.some(e => e.data.title === char.name)) continue;

      const createEmbed = (c) => {
        const embed = new EmbedBuilder()
          .setTitle(c.name)
          .setDescription(`属性: ${c.attribute}　ロール: ${c.role}　ポジション: ${c.position}`)
          .setColor(0x999999)
          .setImage(c.image)
          .addFields(
            { name: '魔力覚醒順', value: c.awakening_order.join(" → "), inline: false },
            { name: '\u200b\u200b', value: '\u200b\u200b', inline: false },
            { name: '奥義', value: `【${c.skills["奥義"].name}】\n${c.skills["奥義"].base}\n【覚醒】${c.skills["奥義"].awakened}` },
            { name: '\u200b\u200b', value: '\u200b\u200b', inline: false },
            { name: '特技1', value: `【${c.skills["特技1"].name}】\n${c.skills["特技1"].base}\n【覚醒】${c.skills["特技1"].awakened}` },
            { name: '\u200b\u200b', value: '\u200b\u200b', inline: false },
            { name: '特技2', value: `【${c.skills["特技2"].name}】\n${c.skills["特技2"].base}\n【覚醒】${c.skills["特技2"].awakened}` },
            { name: '\u200b\u200b', value: '\u200b\u200b', inline: false },
            { name: '特殊能力', value: `【${c.skills["特殊"].name}】\n${c.skills["特殊"].base}\n【覚醒】${c.skills["特殊"].awakened}` }
          );

        if (c.awakening_order.includes("通常") && c.skills["通常"]) {
          embed.addFields({
            name: '通常',
            value: `【${c.skills["通常"].name}】\n${c.skills["通常"].base}\n【覚醒】${c.skills["通常"].awakened}`
          });
        }

        embed.addFields(
          { name: '\u200b\u200b', value: '\u200b\u200b', inline: false },
          { name: 'コンボ', value: c.combo || '―' },
          { name: '\u200b\u200b', value: '\u200b\u200b', inline: false },
          { name: 'グループ', value: (c.group || []).join(', ') || '―' }
        );

        if (c.magitools) {
          if (c.magitools.normal?.name) {
            embed.addFields({
              name: '魔道具①',
              value: `【${c.magitools.normal.name}】\n${c.magitools.normal.effect}`
            });
          }
          if (c.magitools.normal2?.name) {
            embed.addFields({
              name: '魔道具②',
              value: `【${c.magitools.normal2.name}】\n${c.magitools.normal2.effect}`
            });
          } else if (c.magitools.ss_plus?.name) {
            embed.addFields({
              name: '魔道具（SS+）',
              value: `【${c.magitools.ss_plus.name}】\n${c.magitools.ss_plus.effect}`
            });
          }
        }

        return embed;
      };

      if (isTag && !showOnlyOne) {
        const pair = data.find(c =>
          c.id === char.id &&
          c.name !== char.name &&
          c.group?.includes("タッグ")
        );
        embeds.push(createEmbed(char));
        if (pair) embeds.push(createEmbed(pair));
      } else {
        embeds.push(createEmbed(char));
      }
    }

    return interaction.editReply({ embeds });
  }
};
