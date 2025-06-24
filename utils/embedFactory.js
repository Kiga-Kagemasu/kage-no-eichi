const { EmbedBuilder } = require('discord.js');

function generateCharacterEmbed(char) {
  const embed = new EmbedBuilder()
    .setTitle(`${char.name} の性能`)
    .setColor(0x6699ff)
    .setDescription(char.description || '（説明なし）');

  if (char.attribute) embed.addFields({ name: '属性', value: char.attribute, inline: true });
  if (char.role) embed.addFields({ name: 'ロール', value: char.role, inline: true });
  if (char.position !== undefined) embed.addFields({ name: 'ポジション', value: `${char.position}`, inline: true });

  if (char.skills && char.skills.length > 0) {
    embed.addFields({ name: 'スキル', value: char.skills.join('\n') });
  }

  return embed;
}

module.exports = { generateCharacterEmbed };
