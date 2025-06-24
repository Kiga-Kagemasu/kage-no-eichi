const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const data = require('../characters.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('名前検索')
    .setDescription('キャラ名や別名から選択して性能を確認します')
    .addStringOption(option =>
      option.setName('キーワード')
        .setDescription('キャラクター名または略称')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const keyword = interaction.options.getString('キーワード');
    const regex = new RegExp(keyword, 'i');

    const matched = data.filter(c =>
      regex.test(c.name) || (c.aliases && c.aliases.some(alias => regex.test(alias)))
    );

    if (matched.length === 0) {
      return interaction.editReply('該当キャラが見つかりません。');
    }

    const limited = matched.slice(0, 25); // セレクトメニューの上限

    const menu = new StringSelectMenuBuilder()
      .setCustomId('select-character')
      .setPlaceholder('キャラを選択してください')
      .addOptions(limited.map(c => ({
        label: c.name.length > 100 ? c.name.slice(0, 100) : c.name,
        value: c.id
      })));

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.editReply({
      content: 'キャラクターを選択してください：',
      components: [row]
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId === 'select-character' && i.user.id === interaction.user.id,
      time: 60_000
    });

    collector.on('collect', async i => {
      await i.deferUpdate();

      const selectedId = i.values[0];
      const char = data.find(c => c.id === selectedId);
      if (!char) {
        return await interaction.editReply({ content: '選択されたキャラが見つかりませんでした。', components: [] });
      }

      const isTag = char.group?.includes("タッグ");
      const isLeft = /\[L\]/.test(char.name);
      const isRight = /\[R\]/.test(char.name);
      const showOnlyOne = isLeft || isRight;

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
          } else if (c.magitools.ss_plus?.name && c.magitools.ss_plus.name !== '未実装') {
            embed.addFields({
              name: '魔道具（SS+）',
              value: `【${c.magitools.ss_plus.name}】\n${c.magitools.ss_plus.effect}`
            });
          }
        }

        return embed;
      };

      const embeds = [];

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

      await interaction.editReply({ content: '性能を表示しました。', embeds, components: [] });
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: '時間切れになりました。',
          components: []
        });
      }
    });
  }
};
