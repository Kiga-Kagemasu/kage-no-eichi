const { EmbedBuilder } = require('discord.js');

function createCharacterListEmbed(characters, page, keyword) {
  const itemsPerPage = 10;
  const start = page * itemsPerPage;
  const end = start + itemsPerPage;
  const sliced = characters.slice(start, end);

  return new EmbedBuilder()
    .setTitle(`名前に「${keyword}」を含むキャラ（${page + 1}ページ目）`)
    .setDescription(
      sliced.map(c => `・${c.name}（ID: ${c.id}）`).join('\n')
    )
    .setColor(0x00BFFF)
    .setFooter({ text: `全${characters.length}件中 ${start + 1}〜${Math.min(end, characters.length)}件を表示` });
}

module.exports = {
  createCharacterListEmbed
};
