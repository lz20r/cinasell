module.exports = {
  name: "guildScheduledEventDelete",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Evento Programado Eliminado",
      description: `Se ha eliminado un evento programado`,
      timestamp: new Date(),
      fields: [],
      color: 0xff0000,
      footer: { text: `Eliminado por: ${data.executor?.tag || "Desconocido"}` },
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

    const statuses = {
      1: " Programado",
      2: " Activo",
      3: " Completado",
      4: " Cancelado"
    };

    embed.fields.push({
      name: " Estado al Eliminar",
      value: statuses[data.target.status] || "Desconocido",
      inline: true
    });

    if (data.target.scheduled_start_time) {
      embed.fields.push({
        name: " Inicio Programado",
        value: `<t:${Math.floor(new Date(data.target.scheduled_start_time).getTime() / 1000)}:F>`,
        inline: true
      });
    }

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
