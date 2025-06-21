const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('性能検索')
    .setDescription('特定の効果を持つキャラを検索します')
    .addStringOption(option =>
      option.setName('効果')
        .setDescription('検索したい効果（例：回避、出血など）')
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('スラッシュコマンドを登録中...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('スラッシュコマンドを登録しました！');
  } catch (error) {
    console.error('❌ エラー:', error);
  }
})();
