require('dotenv').config(); // これが必要です！

const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = process.env;
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('スラッシュコマンドを登録中...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('登録完了。');
  } catch (error) {
    console.error(error);
  }
})();
