module.exports = {
  name: "guildScheduledEventCreate",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Evento Programado Creado",
      description: `Se ha creado un nuevo evento programado`,
      timestamp: new Date(),
      fields: [],
      color: 0x00ff00,
      footer: { text: `Creado por: ${data.executor?.tag || "Desconocido"}` },
    };

    embed.fields.push({
      name: " Nombre del Evento",
      value: `\`${data.target.name}\``,
      inline: true
    });

    embed.fields.push({
      name: " ID del Evento",
      value: `\`${data.target.id}\``,
      inline: true
    });

    if (data.target.description) {
      embed.fields.push({
        name: " Descripción",
        value: data.target.description,
        inline: false
      });
    }

    embed.fields.push({
      name: " Inicio Programado",
      value: `<t:${Math.floor(new Date(data.target.scheduled_start_time).getTime() / 1000)}:F>`,
      inline: true
    });

    if (data.target.scheduled_end_time) {
      embed.fields.push({
        name: " Fin Programado",
        value: `<t:${Math.floor(new Date(data.target.scheduled_end_time).getTime() / 1000)}:F>`,
        inline: true
      });
    }

    const entityTypes = {
      1: " Canal de Voz",
      2: " Lugar Específico",
      3: " Externo"
    };

    embed.fields.push({
      name: " Tipo de Ubicación",
      value: entityTypes[data.target.entity_type] || "Desconocido",
      inline: true
    });

    if (data.target.entity_metadata?.location) {
      embed.fields.push({
        name: " Ubicación",
        value: data.target.entity_metadata.location,
        inline: true
      });
    }

    if (data.target.channel_id) {
      embed.fields.push({
        name: " Canal",
        value: `<#${data.target.channel_id}>`,
        inline: true
      });
    }

    const privacyLevels = {
      2: " Solo miembros del servidor"
    };

    embed.fields.push({
      name: " Privacidad",
      value: privacyLevels[data.target.privacy_level] || "Desconocido",
      inline: true
    });

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
