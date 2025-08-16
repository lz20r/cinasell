module.exports = {
  name: "threadCreate",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Hilo Creado",
      description: `Se ha creado un nuevo hilo`,
      timestamp: new Date(),
      fields: [],
      color: 0x00ff00,
      footer: { text: `Creado por: ${data.executor?.tag || "Desconocido"}` },
    };

    embed.fields.push({
      name: " Nombre del Hilo",
      value: `\`${data.target.name}\``,
      inline: true
    });

    embed.fields.push({
      name: " ID del Hilo",
      value: `\`${data.target.id}\``,
      inline: true
    });

    embed.fields.push({
      name: " Canal Padre",
      value: `<#${data.target.parent_id}>`,
      inline: true
    });

    const threadTypes = {
      10: " Hilo de Anuncio",
      11: " Hilo Público",
      12: " Hilo Privado"
    };

    embed.fields.push({
      name: " Tipo de Hilo",
      value: threadTypes[data.target.type] || "Desconocido",
      inline: true
    });

    if (data.target.auto_archive_duration) {
      const durations = {
        60: "1 hora",
        1440: "1 día", 
        4320: "3 días",
        10080: "1 semana"
      };
      embed.fields.push({
        name: " Auto-Archivo",
        value: durations[data.target.auto_archive_duration] || `${data.target.auto_archive_duration} minutos`,
        inline: true
      });
    }

    if (data.target.rate_limit_per_user) {
      embed.fields.push({
        name: " Modo Lento",
        value: `${data.target.rate_limit_per_user} segundos`,
        inline: true
      });
    }

    if (data.target.message_count !== undefined) {
      embed.fields.push({
        name: " Mensajes",
        value: `${data.target.message_count}`,
        inline: true
      });
    }

    if (data.target.member_count !== undefined) {
      embed.fields.push({
        name: " Miembros",
        value: `${data.target.member_count}`,
        inline: true
      });
    }

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
