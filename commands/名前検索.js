const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('名前検索')
    .setDescription('キャラ名または略称から検索して1体選んで表示'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const options = data.map(c =>
      new StringSelectMenuOptionBuilder()
        .setLabel(c.name.slice(0, 100))
        .setValue(c.id)
    );

    const menu = new StringSelectMenuBuilder()
      .setCustomId('character_select')
      .setPlaceholder('キャラを選択')
      .addOptions(options.slice(0, 25));

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.editReply({
      content: 'キャラクターを選んでください：',
      components: [row],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId === 'character_select' && i.user.id === interaction.user.id,
      time: 60_000,
      max: 1,
    });

    collector.on('collect', async selectInteraction => {
      const selectedId = selectInteraction.values[0];
      const character = data.find(c => c.id === selectedId);
      if (!character) {
        return selectInteraction.update({ content: 'キャラが見つかりません。', components: [] });
      }

      const embed = createCharacterEmbed(character);
      await selectInteraction.update({
        content: '選択したキャラの性能はこちら：',
        embeds: [embed],
        components: [],
      });
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        try {
          await interaction.editReply({
            content: '⏱ タイムアウトしました。再度コマンドを実行してください。',
            components: [],
          });
        } catch (err) {
          // 応答済みエラー回避
          console.warn('Edit after timeout failed:', err.message);
        }
      }
    });
  },
};

function createCharacterEmbed(c) {
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
      { name: '特殊能力', value: `【${c.skills["特殊"].name}】\n${c.skills["特殊"].base}\n【覚醒】${c.skills["特殊"].awakened}` }
    );

  if (c.awakening_order.includes("通常") && c.skills["通常"]) {
    embed.addFields({
      name: '通常',
      value: `【${c.skills["通常"].name}】\n${c.skills["通常"].base}\n【覚醒】${c.skills["通常"].awakened}`
    });
  }

  embed.addFields(
    { name: 'コンボ', value: c.combo || '―' },
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
    } else if (c.magitools.ss_plus?.name && c.magitools.ss_plus.name !== "未実装") {
      embed.addFields({
        name: '魔道具（SS+）',
        value: `【${c.magitools.ss_plus.name}】\n${c.magitools.ss_plus.effect}`
      });
    }
  }

  return embed;
}
