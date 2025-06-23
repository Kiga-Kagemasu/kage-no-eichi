const { EmbedBuilder } = require('discord.js');

function generatePaginatedEmbeds(characters, pageSize = 10) {
  const embeds = [];
  for (let i = 0; i < characters.length; i += pageSize) {
    const current = characters.slice(i, i + pageSize);
    const embed = new EmbedBuilder()
      .setTitle(`🔍 名前に一致するキャラ一覧`)
      .setDescription(
        current.map((c, index) => `${i + index + 1}. ${c.name}`).join('\n')
      )
      .setColor(0x888888)
      .setFooter({ text: `全${characters.length}件中 ${i + 1}〜${i + current.length}件を表示` });

    embeds.push(embed);
  }
  return embeds;
}

module.exports = {
  generatePaginatedEmbeds,
};
