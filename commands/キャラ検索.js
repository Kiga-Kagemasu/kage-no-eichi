const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
    const matched = data.filter(c =>
      regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
    );

    if (matched.length === 0) {
      return interaction.reply('該当キャラが見つかりません。');
    }

    const embeds = [];

    for (const char of matched) {
      const isTag = char.group?.includes("タッグ");
      const isLeft = /\[L\]/.test(char.name);
      const isRight = /\[R\]/.test(char.name);
      const showOnlyOne = isLeft || isRight;

      // すでに追加済みのキャラを省く
      if (embeds.some(e => e.data.title === char.name)) continue;

      const createEmbed = (c) => {
        const embed = new EmbedBuilder()
          .setTitle(c.name)
          .setDescription(`属性: ${c.attribute}　ロール: ${c.role}　ポジション: ${c.position}`)
          .setColor(0x999999)
          .setImage(c.image)
          .addFields(
            { name: '魔力覚醒順', value: c.awakening_order.join(" → "), inline: false },
            { name: '奥義', value: `【${c.skills["奥義"].name}】\n${c.skills["奥義"].base}\n【覚醒】${c.skills["奥義"].awakened}` },
            { name: '特技1', value: `【${c.skills["特技1"].name}】\n${c.skills["特技1"].base}\n【覚醒】${c.skills["特技1"].awakened}` },
            { name: '特技2', value: `【${c.skills["特技2"].name}】\n${c.skills["特技2"].base}\n【覚醒】${c.skills["特技2"].awakened}` },
            { name: '特殊能力', value: `【${c.skills["特殊"].name}】\n${c.skills["特殊"].base}\n【覚醒】${c.skills["特殊"].awakened}` },
            { name: 'コンボ', value: c.combo || '―' },
            { name: 'グループ', value: (c.group || []).join(', ') || '―' }
          );

        if (c.magitools) {
          // 魔道具（通常①）
          if (c.magitools.normal && c.magitools.normal.name) {
            embed.addFields({
              name: '魔道具①',
              value: `【${c.magitools.normal.name}】\n${c.magitools.normal.effect}`
            });
          }
          // 魔道具（通常②：魔人化キャラ向け）
          if (c.magitools.normal2 && c.magitools.normal2.name) {
            embed.addFields({
              name: '魔道具②',
              value: `【${c.magitools.normal2.name}】\n${c.magitools.normal2.effect}`
            });
          } else if (c.magitools.ss_plus && c.magitools.ss_plus.name) {
            // SS+魔道具（通常キャラ向け）
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

    return interaction.reply({ embeds });
  }
};
