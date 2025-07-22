const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

const FEEDBACK_CHANNEL_ID = '1397283435835560149';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8_フィードバック')
    .setDescription('botの不具合やミス、要望など、匿名で送信します')
    .addStringOption(option =>
      option.setName('内容')
        .setDescription('報告内容を入力してください')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('添付')
        .setDescription('任意で画像や動画を添付できます')
        .setRequired(false)
    ),

  async execute(interaction) {
    const content = interaction.options.getString('内容');
    const image = interaction.options.getAttachment('添付');
    const channel = await interaction.client.channels.fetch(FEEDBACK_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      return await interaction.reply({ content: '送信先チャンネルが見つかりません。', ephemeral: true });
    }

    const messageOptions = {
      content: ` **フィードバック受信**\n${content}`,
    };

    if (image) {
      messageOptions.files = [image.url];
    }

    await channel.send(messageOptions);

    await interaction.reply({ content: 'フィードバックを送信しました。ありがとうございました！', ephemeral: true });
  }
};