module.exports = {
  name: "webhookDelete",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Webhook Eliminado",
      description: `Se ha eliminado un webhook`,
      timestamp: new Date(),
      fields: [],
      color: 0xff0000,
      footer: { text: `Eliminado por: ${data.executor?.tag || "Desconocido"}` },
    };

    embed.fields.push({
      name: " Nombre del Webhook",
      value: `\`${data.target.name}\``,
      inline: true
    });

    embed.fields.push({
      name: " ID del Webhook",
      value: `\`${data.target.id}\``,
      inline: true
    });

    embed.fields.push({
      name: " Canal",
      value: `<#${data.target.channel_id}>`,
      inline: true
    });

    const webhookTypes = {
      1: " Webhook Entrante",
      2: " Webhook de Canal Seguido", 
      3: " Webhook de Aplicación"
    };

    embed.fields.push({
      name: " Tipo",
      value: webhookTypes[data.target.type] || "Desconocido",
      inline: true
    });

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
