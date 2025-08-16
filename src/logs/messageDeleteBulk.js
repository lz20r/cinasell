// 📁 src/logs/messageDeleteBulk.js
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageDeleteBulk",

  async load(data, channel, client) {
    const messages = data.target; // Map de mensajes
    const executor = data.executor; // Moderador si existe
    const channelObj = client.channels.cache.get(channel);

    if (!channelObj || messages.size === 0) return;

    const firstMessage = messages.first();

    const bulkEmbed = new EmbedBuilder()
      .setColor(0xff6b6b)
      .setAuthor({
        name: "Messages deleted",
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription([
        `> Channel: <#${firstMessage.channelId}> (\`#${channelObj.name}\`)`,
        `> Total messages deleted: \`${messages.size}\``,
        executor ? `> Deleted by: \`${executor.tag}\`` : null
      ].filter(Boolean).join("\n"))
      .setFooter({
        text: `hoy a las ${formatHour(new Date())}`,
        iconURL: client.user.displayAvatarURL()
      });

    await channelObj.send({ embeds: [bulkEmbed] });

    for (const message of messages.values()) {
      if (!message.author || message.author.bot) continue;

      const singleEmbed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setAuthor({ name: `Message deleted`, iconURL: client.user.displayAvatarURL() })
        .setDescription([
          `> Author: <@${message.author.id}> (\`${message.author.tag}\`)`,
          `> Message ID: \`${message.id}\``
        ].join("\n"))
        .addFields({
          name: "Message",
          value: message.content?.slice(0, 1024) || "*Sin contenido*"
        })
        .setFooter({
          text: `hoy a las ${formatHour(new Date(message.createdTimestamp || Date.now()))}`,
          iconURL: client.user.displayAvatarURL()
        });

      await channelObj.send({ embeds: [singleEmbed] });
    }
  }
};

function formatHour(date) {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}
