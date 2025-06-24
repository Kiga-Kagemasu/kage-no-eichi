const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const characters = require('./characters.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
const token = process.env.DISCORD_TOKEN;

// コマンド読み込み
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// 起動ログ
client.once('ready', () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
});

// Interaction 処理
client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_character') {
        const charId = interaction.values[0];
        const character = characters.find(c => c.id === charId || c.name === charId);
        if (!character) {
          return await interaction.update({
            content: 'キャラが見つかりませんでした。',
            components: [],
            ephemeral: true
          });
        }

        // Embed生成関数
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

        const isTag = character.group?.includes("タッグ");
        const isLeft = /\[L\]/.test(character.name);
        const isRight = /\[R\]/.test(character.name);
        const showOnlyOne = isLeft || isRight;

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

        await interaction.update({
         content: '性能を表示しました。',
         embeds,
         components: []
        });

      }
    }
  } catch (err) {
    console.error('❌ interactionCreate中にエラー:', err);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'コマンド実行中にエラーが発生しました。',
          ephemeral: true
        });
      }
    } catch (err2) {
      console.error('❌ エラーレスポンス失敗:', err2);
    }
  }
});

client.login(token);
