const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('スコア計算')
    .setDescription('与ダメージ、HP、ボーナス、スコアのいずれかを自動計算')
    .addStringOption(opt =>
      opt.setName('与ダメージ')
        .setDescription('例：5000万')
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('ボスhp')
        .setDescription('例：1億')
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('イベントボーナス')
        .setDescription('％表記（例：56）')
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('スコア')
        .setDescription('例：600000')
        .setRequired(false)
    ),

  async execute(interaction) {
    const rawA = interaction.options.getString('与ダメージ');
    const rawB = interaction.options.getString('ボスhp');
    const rawC = interaction.options.getString('イベントボーナス');
    const rawD = interaction.options.getString('スコア');

    const parseNumber = str => {
      if (!str) return null;
      return Number(str.replace(/[^\d.]/g, '')
        .replace(/万/g, '0000')
        .replace(/億/g, '00000000')
        .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
    };

    const a = parseNumber(rawA);
    const b = parseNumber(rawB);
    const c = parseNumber(rawC);
    const d = parseNumber(rawD);

    let result = '❌ 正常に計算できませんでした。値を3つ入力してください。';

    // スコアを計算
    if (a && b && c && !d) {
      const ratio = Math.min(1, a / b);
      const score = Math.floor(600000 * ratio * (1 + c / 100));
      result = `スコア: ${score.toLocaleString()}点`;
    }
    // 与ダメージを計算
    else if (b && c && d && !a) {
      const dmg = Math.floor((d / 600000) * (b / (1 + c / 100)));
      result = `与ダメージ: ${dmg.toLocaleString()}`;
    }
    // ボスHPを計算
    else if (a && c && d && !b) {
      const hp = Math.floor((a * (1 + c / 100) * 600000) / d);
      result = `ボスHP: ${hp.toLocaleString()}`;
    }
    // ボーナスを計算
    else if (a && b && d && !c) {
      const ratio = Math.min(1, a / b);
      const bonus = (d / (600000 * ratio)) - 1;
      result = `イベントボーナス: ${(bonus * 100).toFixed(2)}%`;
    }

    await interaction.reply({ content: result, ephemeral: true });
  }
};
