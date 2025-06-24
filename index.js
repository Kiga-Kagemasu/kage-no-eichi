client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error('❌ コマンド実行時エラー:', err);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
        } else {
          await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
        }
      } catch (followErr) {
        console.error('❌ エラーレスポンス失敗:', followErr);
      }
    }
  }

  // ✅ セレクトメニュー処理（collectorを使わない安定方式）
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_character') {
    try {
      const charId = interaction.values[0];
      const character = characters.find(c => c.id === charId || c.name === charId);
      if (!character) {
        return await interaction.reply({ content: 'キャラが見つかりません。', ephemeral: true });
      }

      const isTag = character.group?.includes("タッグ");
      const isLeft = /\[L\]/.test(character.name);
      const isRight = /\[R\]/.test(character.name);
      const showOnlyOne = isLeft || isRight;

      const createEmbed = (c) => {
        const embed = new EmbedBuilder()
          .setTitle(c.name)
          .setDescription(`属性: ${c.attribute}　ロール: ${c.role}　ポジション: ${c.position}`)
          .setColor(0x999999)
          .setImage(c.image)
          .addFields(
            { name: '魔力覚醒順', value: c.awakening_order.join(" → ") },
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
        const pair = characters.find(c =>
          c.id === character.id &&
          c.name !== character.name &&
          c.group?.includes("タッグ")
        );
        embeds.push(createEmbed(character));
        if (pair) embeds.push(createEmbed(pair));
      } else {
        embeds.push(createEmbed(character));
      }

      await interaction.update({ content: '性能を表示しました。', embeds, components: [] });
    } catch (err) {
      console.error('❌ セレクト処理中にエラー:', err);
    }
  }
});
