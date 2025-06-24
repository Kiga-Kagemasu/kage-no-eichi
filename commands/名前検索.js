const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('名前検索')
    .setDescription('キャラ名・略称から名前一覧を表示'),

  async execute(interaction) {
    const matched = data.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

    const options = matched.map(c => ({
      label: c.name.length > 25 ? c.name.slice(0, 22) + '…' : c.name,
      description: c.aliases?.[0] || '（略称なし）',
      value: c.id
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_character')
      .setPlaceholder('キャラを1体選んでください')
      .addOptions(options.slice(0, 25)); // 25件まで

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: '性能を確認したいキャラを選択してください：',
      components: [row],
      flags: 64 // ephemeral
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId === 'select_character' && i.user.id === interaction.user.id,
      time: 60_000,
      max: 1
    });

    collector.on('collect', async select => {
      const selectedId = select.values[0];
      const char = data.find(c => c.id === selectedId);

      if (!char) {
        return select.update({
          content: 'キャラ情報が見つかりませんでした。',
          components: [],
          embeds: []
        });
      }

      const embed = createEmbed(char);
      await select.update({
        content: `${char.name} の性能情報：`,
        embeds: [embed],
        components: []
      });
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          content: '時間切れのためキャンセルされました。',
          components: []
        }).catch(() => {});
      }
    });

    function createEmbed(c) {
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
        if (c.magitools.normal && c.magitools.normal.name) {
          embed.addFields({
            name: '魔道具①',
            value: `【${c.magitools.normal.name}】\n${c.magitools.normal.effect}`
          });
        }
        if (c.magitools.normal2 && c.magitools.normal2.name) {
          embed.addFields({
            name: '魔道具②',
            value: `【${c.magitools.normal2.name}】\n${c.magitools.normal2.effect}`
          });
        } else if (c.magitools.ss_plus && c.magitools.ss_plus.name) {
          embed.addFields({
            name: '魔道具（SS+）',
            value: `【${c.magitools.ss_plus.name}】\n${c.magitools.ss_plus.effect}`
          });
        }
      }

      return embed;
    }
  }
};
