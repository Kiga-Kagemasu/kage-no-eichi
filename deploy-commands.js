const { REST, Routes } = require('discord.js');
const fs = require('fs');
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
    console.log('スラッシュコマンドをDiscordに登録中...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.clientId, process.env.guildId),
      { body: commands }
    );
    console.log('登録完了！');
  } catch (error) {
    console.error(error);
  }
})();
