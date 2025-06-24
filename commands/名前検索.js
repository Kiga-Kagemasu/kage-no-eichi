const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('名前検索')
    .setDescription('キャラ名または略称で検索し、選んで性能を表示します')
    .addStringOption(option =>
      option.setName('名前')
        .setDescription('キャラ名または略称（例：アルファ）')
        .setRequired(true)
    ),

  async execute(interaction) {
    const keyword = interaction.options.getString('名前');
    const regex = new RegExp(keyword, 'i');
    const matched = data.filter(c =>
      regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
    );

    if (matched.length === 0) {
      return interaction.reply({ content: '該当キャラが見つかりません。', ephemeral: true });
    }

    // 最大25件まで表示（Discordの制限）
    const options = matched.slice(0, 25).map(c => ({
      label: c.name,
      value: c.id,
    }));

    const select = new StringSelectMenuBuilder()
      .setCustomId('select-character')
      .setPlaceholder('キャラを選んでください')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({
      content: '性能を確認したいキャラを選択してください：',
      components: [row],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 30000,
    });

    collector.on('collect', async selectInteraction => {
      if (selectInteraction.user.id !== interaction.user.id) {
        return selectInteraction.reply({ content: 'このメニューはあなた専用です。', ephemeral: true });
      }

      const selectedId = selectInteraction.values[0];
      const char = data.find(c => c.id === selectedId);

      if (!char) {
        return selectInteraction.reply({ content: 'キャラが見つかりませんでした。', ephemeral: true });
      }

      const embed = createCharacterEmbed(char);
      await selectInteraction.update({ content: '', embeds: [embed], components: [] });
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        try {
          await interaction.editReply({
            content: '⏰ 時間切れです。再度コマンドを入力してください。',
            components: []
          });
        } catch (e) {
          // interactionが既に終了している可能性あり
        }
      }
    });
  }
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
    } else if (c.magitools.ss_plus?.name) {
      embed.addFields({
        name: '魔道具（SS+）',
        value: `【${c.magitools.ss_plus.name}】\n${c.magitools.ss_plus.effect}`
      });
    }
  }

  return embed;
}
