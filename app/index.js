const fs = require('fs');
const path = require('path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');
const characters = require('./characters.json');

function normalize(str) {
  if (!str) return '';
  return str
    .normalize('NFKC')
    .replace(/[\uFF65-\uFF9F]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEC0));
}

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

client.once('ready', () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);

    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('select_character')) {
        const selectedName = normalize(interaction.values[0]);
        const selected = characters.find(c => normalize(c.name) === selectedName);
        if (!selected) {
          return await interaction.update({
            content: 'キャラが見つかりませんでした。',
            components: [],
            flags: 64
          });
        }

        const createEmbed = (c) => {
          const embed = new EmbedBuilder()
            .setTitle(c.name)
            .setDescription(`属性: ${c.attribute}　ロール: ${c.role}　ポジション: ${c.position}`)
            .setColor(0x999999)
            .setImage(c.image)
            .addFields(
              { name: '魔力覚醒順', value: c.awakening_order.join(" → ") },
              { name: '\u200b', value: '\u200b', inline: false },
              { name: '奥義', value: `【${c.skills["奥義"].name}】\n${c.skills["奥義"].base}\n【覚醒】${c.skills["奥義"].awakened}` },
              { name: '\u200b', value: '\u200b', inline: false },
              { name: '特技1', value: `【${c.skills["特技1"].name}】\n${c.skills["特技1"].base}\n【覚醒】${c.skills["特技1"].awakened}` },
              { name: '\u200b', value: '\u200b', inline: false },
              { name: '特技2', value: `【${c.skills["特技2"].name}】\n${c.skills["特技2"].base}\n【覚醒】${c.skills["特技2"].awakened}` },
              { name: '\u200b', value: '\u200b', inline: false },
              { name: '特殊能力', value: `【${c.skills["特殊"].name}】\n${c.skills["特殊"].base}\n【覚醒】${c.skills["特殊"].awakened}` }
            );

          if (c.awakening_order.includes("通常") && c.skills["通常"]) {
            embed.addFields({
              name: '通常',
              value: `【${c.skills["通常"].name}】\n${c.skills["通常"].base}\n【覚醒】${c.skills["通常"].awakened}`
            });
          }

          embed.addFields(
            { name: '\u200b', value: '\u200b', inline: false },
            { name: 'コンボ', value: c.combo || '―' },
            { name: '\u200b', value: '\u200b', inline: false },
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

        const isTag = selected.group?.includes("タッグ");
        const isLeft = /\[L\]/.test(selected.name);
        const isRight = /\[R\]/.test(selected.name);
        const showOnlyOne = isLeft || isRight;

        const embeds = [];
        if (isTag && !showOnlyOne) {
          const pair = characters.find(c => c.id === selected.id && c.name !== selected.name && c.group?.includes("タッグ"));
          embeds.push(createEmbed(selected));
          if (pair) embeds.push(createEmbed(pair));
        } else {
          embeds.push(createEmbed(selected));
        }

        await interaction.update({
          content: '性能を表示しました。',
          embeds: embeds.slice(0, 10),
          components: []
        });
      }
    }
  } catch (err) {
    console.error('❌ interactionCreate中にエラー:', err);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', flags: 64 });
      }
    } catch (err2) {
      console.error('❌ エラーレスポンス失敗:', err2);
    }
  }
});

client.login(token);

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Bot is running!');
});
app.listen(PORT, () => {
  console.log(`🌐 HTTPサーバーがポート ${PORT} で起動しました`);
});
