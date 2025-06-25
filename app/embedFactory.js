const { EmbedBuilder } = require('discord.js');

function generateCharacterEmbed(character) {
  const embed = new EmbedBuilder()
    .setTitle(`${character.name}`)
    .setDescription(character.description || '（説明なし）')
    .addFields(
      { name: '属性', value: character.attribute || '不明', inline: true },
      { name: 'ロール', value: character.role || '不明', inline: true },
      { name: 'ポジション', value: `${character.position ?? '不明'}`, inline: true }
    )
    .setColor(0x6e00ff);

  if (character.skills) {
    for (const skill of character.skills) {
      embed.addFields({
        name: `🟣 ${skill.name}`,
        value: skill.description || '（説明なし）'
      });
    }
  }

  return embed;
}

module.exports = { generateCharacterEmbed };
