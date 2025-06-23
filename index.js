// Webサーバー（UptimeRobot用）
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(3000, () => console.log('Web server is ready.'));

// 必要なモジュールの読み込み
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

// Discordクライアント初期化
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// コマンド読み込み
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Bot起動時
client.once('ready', () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
});

// interaction の処理（スラッシュコマンド & ボタン）
client.on('interactionCreate', async interaction => {
  // スラッシュコマンド処理
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('❌ コマンド実行時にエラー:', error);
      await interaction.reply({
        content: 'コマンド実行中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }

  // ボタン処理（ページング用）
  if (interaction.isButton()) {
    try {
      const [action, keyword, rawPage] = interaction.customId.split('_');
      const page = parseInt(rawPage, 10);
      const newPage = action === 'next' ? page + 1 : page - 1;

      const data = require('./characters.json');
      const regex = new RegExp(keyword, 'i');
      const found = data.filter(c => regex.test(c.name));

      const { createCharacterListEmbed } = require('./utils/embedFactory');
      const embed = createCharacterListEmbed(found, newPage, keyword);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`prev_${keyword}_${newPage}`)
          .setLabel('← 前へ')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(newPage === 0),
        new ButtonBuilder()
          .setCustomId(`next_${keyword}_${newPage}`)
          .setLabel('次へ →')
          .setStyle(ButtonStyle.Primary)
          .setDisabled((newPage + 1) * 10 >= found.length)
      );

      await interaction.update({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('❌ ボタン処理中にエラー:', error);
    }
  }
});

// Botログイン
client.login(process.env.DISCORD_TOKEN);
