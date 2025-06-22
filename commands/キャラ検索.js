const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const data = require('../characters.json');

const tagTeams = ['イプシロン＆ベータ', 'シャドウ＆アウロラ', 'ゼータ＆デルタ']; // タッグ名の共通部分

module.exports = {
  data: new SlashCommandBuilder()
    .setName('キャラ検索')
    .setDescription('キャラクター名から性能を検索します')
    .addStringOption(option =>
      option.setName('名前')
        .setDescription('キャラクター名または略称（「:L」「:R」指定可）')
        .setRequired(true)
    ),

  async execute(interaction) {
    const keywordRaw = interaction.options.getString('名前');
    const keyword = keywordRaw.replace(/[:：]\s*/g, ':'); // コロンの揺れを吸収
    const [base, side] = keyword.split(':'); // 「アルファ＆ベータ:L」→ ["アルファ＆ベータ", "L"]

    const regex = new RegExp(base, 'i');

    // タッグキャラは複数候補を返す
    const matched = data.filter(c =>
      regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
    );

    if (matched.length === 0) {
      return interaction.reply('該当キャラが見つかりません。');
    }

    let targets = matched;

    // L or Rなどの指定がある場合、そちらに絞る
    if (side && ['L', 'R'].includes(side.toUpperCase())) {
      targets = matched.filter(c => c.name.includes(`[${side.toUpperCase()}]`));
    }

    const embeds = targets.map(char => {
      const embed = new EmbedBuilder()
        .setTitle(char.name)
        .setDescription(`属性: ${char.attribute}　ロール: ${char.role}　ポジション: ${char.position}`)
        .setColor(0x999999)
        .setImage(char.image)
        .addFields(
          { name: '魔力覚醒順', value: char.awakening_order.join(" → "), inline: false },
          { name: '奥義', value: `【${char.skills["奥義"].name}】\n${char.skills["奥義"].base}\n【覚醒】${char.skills["奥義"].awakened}` },
          { name: '特技1', value: `【${char.skills["特技1"].name}】\n${char.skills["特技1"].base}\n【覚醒】${char.skills["特技1"].awakened}` },
          { name: '特技2', value: `【${char.skills["特技2"].name}】\n${char.skills["特技2"].base}\n【覚醒】${char.skills["特技2"].awakened}` },
          { name: '特殊能力', value: `【${char.skills["特殊"].name}】\n${char.skills["特殊"].base}\n【覚醒】${char.skills["特殊"].awakened}` },
          { name: 'コンボ', value: char.combo || '―' },
          { name: 'グループ', value: (char.group || []).join(', ') || '―' },
          ...(char.magitools
            ? [
                {
                  name: '魔道具（通常）',
                  value: `【${char.magitools.normal.name}】\n${char.magitools.normal.effect}`
                },
                {
                  name: '魔道具（SS+）',
                  value: `【${char.magitools.ss_plus.name}】\n${char.magitools.ss_plus.effect}`
                }
              ]
            : [])
        );

      return embed;
    });

    return interaction.reply({ embeds });
  }
};

