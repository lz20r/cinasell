module.exports = {
  name: "guildSoundboardSoundDelete",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Sonido de Soundboard Eliminado",
      description: `Se ha eliminado un sonido del soundboard`,
      timestamp: new Date(),
      fields: [],
      color: 0xff0000,
      footer: { text: `Eliminado por: ${data.executor?.tag || "Desconocido"}` },
    };

    embed.fields.push({
      name: " Nombre del Sonido",
      value: `\`${data.target.name}\``,
      inline: true
    });

    embed.fields.push({
      name: " ID del Sonido",
      value: `\`${data.target.sound_id}\``,
      inline: true
    });

    if (data.target.emoji_id) {
      embed.fields.push({
        name: " Emoji",
        value: `<:emoji:${data.target.emoji_id}>`,
        inline: true
      });
    } else if (data.target.emoji_name) {
      embed.fields.push({
        name: " Emoji",
        value: data.target.emoji_name,
        inline: true
      });
    }

    embed.fields.push({
      name: " Usuario Propietario",
      value: data.target.user ? `<@${data.target.user.id}>` : "Sistema",
      inline: true
    });

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
