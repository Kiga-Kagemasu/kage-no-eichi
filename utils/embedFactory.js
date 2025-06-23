const { EmbedBuilder } = require('discord.js');

function createCharacterListEmbed(characters, page = 0, keyword = '') {
  const pageSize = 10;
  const start = page * pageSize;
  const end = start + pageSize;
  const total = characters.length;
  const totalPages = Math.ceil(total / pageSize);

  const sliced = characters.slice(start, end);
  const list = sliced.map((c, i) => `${start + i + 1}. ${c.name}`).join('\n') || '該当キャラなし';

  const embed = new EmbedBuilder()
    .setTitle(`🔍 名前に「${keyword}」を含むキャラ一覧`)
    .setDescription(list)
    .setFooter({ text: `ページ ${page + 1} / ${totalPages}` })
    .setColor(0x888888);

  return embed;
}

module.exports = { createCharacterListEmbed };
