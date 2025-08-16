const { Profile } = require('discord-arts');
const { resolveColor, AttachmentBuilder } = require("discord.js");
const Farewell = require("../models/farewell");

module.exports = {
  name: "guildMemberRemove",

  async load(member, client) {
    const { guild } = member;

    try {
      const farewell = await Farewell.findOne({ where: { guildId: guild.id } });
      if (!farewell) return;

      const guildIconURL = guild.iconURL({ extension: 'png' });
      let buffer = null;

      // Solo generar la imagen si el icono del servidor existe
      if (guildIconURL) {
        try {
          buffer = await Profile(member.id, {
            borderColor: ['#ff0000', '#ffa500'],
            customBackground: guildIconURL,
            presenceStatus: 'offline',
            removeAvatarFrame: true,
          });
        } catch (err) {
          console.error("Error al generar la imagen de despedida:", err);
          buffer = null;
        }
      }

      // Personalizar el mensaje de despedida
      let farewellMessage = farewell.message
        .replace(/\[user\]/gi, member.user.username)
        .replace(/\[server\]/gi, guild.name)
        .replace(/\[count\]/gi, guild.memberCount);

      const embed = {
        title: farewell.title || "¡Adiós!",
        description: farewellMessage.trim(),
        color: resolveColor(farewell.color || 0xFF0000),
        timestamp: new Date().toISOString(),
      };

      const paramsMessage = {
        content: `**${member.user.tag}** ha abandonado el servidor.`,
        embeds: [embed]
      };

      if (buffer) {
        const attachment = new AttachmentBuilder(buffer, { name: 'farewell.png' });
        embed.image = { url: "attachment://farewell.png" };
        paramsMessage.files = [attachment];
      }

      const channel = client.channels.cache.get(farewell.channel);
      if (!channel) {
        console.error(`Channel not found: ${farewell.channel}`);
        return;
      }

      await channel.send(paramsMessage);
    } catch (error) {
      console.error("Error en el evento guildMemberRemove:", error);
    }
  },
};