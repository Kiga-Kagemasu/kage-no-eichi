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
      return Number(
        str.replace(/億/g, '00000000')
           .replace(/万/g, '0000')
           .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
           .replace(/[^\d.]/g, '')
      );
    };

    const a = parseNumber(rawA);
    const b = parseNumber(rawB);
    const c = parseNumber(rawC);
    const d = parseNumber(rawD);

    let result = '❌ 計算できませんでした。値を3つだけ入力してください。';

    // スコア計算
    if (a && b && c && !d) {
      const ratio = Math.max(0, a / b);
      const baseScore = 20000 + (ratio * 280000);
      const score = Math.floor(baseScore * (1 + c / 100));
      const finalScore = Math.min(score, 600000);
      result = `スコア: ${finalScore.toLocaleString()}点`;
    }

    // 与ダメージ計算
    else if (b && c && d && !a) {
      const bonusRate = 1 + c / 100;
      const baseScore = d / bonusRate;
      const ratio = Math.max(0, (baseScore - 20000) / 280000);
      const damage = Math.floor(ratio * b);
      result = `与ダメージ: ${damage.toLocaleString()}`;
    }

    // ボスHP計算
    else if (a && c && d && !b) {
      const bonusRate = 1 + c / 100;
      const baseScore = d / bonusRate;
      const ratio = Math.max(0, (baseScore - 20000) / 280000);
      const hp = Math.floor(a / ratio);
      result = `ボスHP: ${hp.toLocaleString()}`;
    }

    // ボーナス計算
    else if (a && b && d && !c) {
      const ratio = Math.max(0, a / b);
      const baseScore = 20000 + (ratio * 280000);
      const bonus = (d / baseScore) - 1;
      result = `イベントボーナス: ${(bonus * 100).toFixed(2)}%`;
    }

    await interaction.reply({ content: result, ephemeral: true });
  }
};
