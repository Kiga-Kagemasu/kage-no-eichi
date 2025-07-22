const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

const FEEDBACK_CHANNEL_ID = 1397283435835560149

module.exports = {
  data: new SlashCommandBuilder()
    .setName('フィードバック')
    .setDescription('不具合や要望を匿名で送信します')
    .addStringOption(option =>
      option.setName('内容')
        .setDescription('報告内容を入力してください')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('画像')
        .setDescription('任意で画像を添付できます')
        .setRequired(false)
    ),

  async execute(interaction) {
    const content = interaction.options.getString('内容');
    const image = interaction.options.getAttachment('画像');
    const channel = await interaction.client.channels.fetch(FEEDBACK_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      return await interaction.reply({ content: '送信先チャンネルが見つかりません。', ephemeral: true });
    }

    const messageOptions = {
      content: `📩 **フィードバック受信**\n${content}`,
    };

    if (image) {
      messageOptions.files = [image.url];
    }

    await channel.send(messageOptions);

    await interaction.reply({ content: '匿名でフィードバックを送信しました。ありがとうございました！', ephemeral: true });
  }
};