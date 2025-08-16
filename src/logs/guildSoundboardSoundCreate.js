module.exports = {
  name: "guildSoundboardSoundCreate",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Sonido de Soundboard Creado",
      description: `Se ha creado un nuevo sonido para el soundboard`,
      timestamp: new Date(),
      fields: [],
      color: 0x00ff00,
      footer: { text: `Creado por: ${data.executor?.tag || "Desconocido"}` },
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
      name: " Archivo",
      value: `\`${data.target.sound_id}.ogg\``,
      inline: true
    });

    if (data.target.volume) {
      embed.fields.push({
        name: " Volumen",
        value: `${Math.round(data.target.volume * 100)}%`,
        inline: true
      });
    }

    embed.fields.push({
      name: " Usuario del Sonido",
      value: data.target.user ? `<@${data.target.user.id}>` : "Sistema",
      inline: true
    });

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
