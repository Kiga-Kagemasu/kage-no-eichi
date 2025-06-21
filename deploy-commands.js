const fs = require('fs');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('スラッシュコマンドを登録中（ギルド限定）...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log('スラッシュコマンドの登録が完了しました！（即時反映）');
  } catch (error) {
    console.error(error);
  }
})();
