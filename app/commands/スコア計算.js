const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('6_スコア計算')
    .setDescription('与ダメ、HP、ボーナス、スコアのいずれかを自動計算')
    .addStringOption(opt =>
      opt.setName('与ダメージ')
        .setDescription('例：半角全角数字、億/万対応　例:5000万')
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('ボスhp')
        .setDescription('例：半角全角数字、億/万対応　例:1億')
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('イベントボーナス')
        .setDescription('％表記（例：56）%はつけてもつけなくても可')
        .setRequired(false))
    .addStringOption(opt =>
      opt.setName('スコア')
        .setDescription('上限60万(例：60万、600000)')
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

    let a = parseNumber(rawA);
    let b = parseNumber(rawB);
    const c = parseNumber(rawC);
    const d = parseNumber(rawD);

    let result = '❌ 計算できませんでした。値を3つだけ入力してください。';

    // スコア計算
    if (a && b && c && !d) {
      const ratio = Math.max(0, a / b);
      const baseScore = 20000 + (ratio * 280000);
      const score = baseScore * (1 + c / 100);
      const finalScore = Math.min(Math.floor(score), 600000);
      result = `スコア: ${finalScore.toLocaleString()}pt`;
    }

    // 与ダメージ計算
    else if (b && c && d && !a) {
      const bonusRate = 1 + c / 100;
      const baseScore = d / bonusRate;
      const ratio = Math.max(0, (baseScore - 20000) / 280000);
      a = Math.floor(ratio * b);
      result = `与ダメージ: ${a.toLocaleString()}`;
    }

    // ボスHP計算
    else if (a && c && d && !b) {
      const bonusRate = 1 + c / 100;
      const baseScore = d / bonusRate;
      const ratio = Math.max(0, (baseScore - 20000) / 280000);
      b = Math.floor(a / ratio);
      result = `ボスHP: ${b.toLocaleString()}`;
    }

    // ボーナス計算
    else if (a && b && d && !c) {
      const ratio = Math.max(0, a / b);
      const baseScore = 20000 + (ratio * 280000);
      const bonus = (d / baseScore) - 1;
      const bonusPercent = Math.floor(bonus * 10000) / 100;
      result = `イベントボーナス: ${bonusPercent.toFixed(2)}%`;
    }

    // HP割合計算（a, b のどちらかが上で求まった場合も含む）
    if (a && b) {
      const hpRatio = Math.floor((a / b) * 10000) / 100;
      result += `\n目標HP割合: ${hpRatio.toFixed(2)}%`;
    }

    await interaction.reply({ content: result, ephemeral: true });
  }
};
