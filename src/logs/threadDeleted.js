module.exports = {
  name: "threadDeleted",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Hilo Eliminado",
      description: `Se ha eliminado un hilo`,
      timestamp: new Date(),
      fields: [],
      color: 0xff0000,
      footer: { text: `Eliminado por: ${data.executor?.tag || "Sistema"}` },
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

    if (data.target.message_count !== undefined) {
      embed.fields.push({
        name: " Mensajes Totales",
        value: `${data.target.message_count}`,
        inline: true
      });
    }

    if (data.target.member_count !== undefined) {
      embed.fields.push({
        name: " Miembros Totales",
        value: `${data.target.member_count}`,
        inline: true
      });
    }

    if (data.target.archived) {
      embed.fields.push({
        name: " Estado al Eliminar",
        value: "Estaba archivado",
        inline: true
      });
    }

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
