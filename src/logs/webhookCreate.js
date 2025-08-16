module.exports = {
  name: "webhookCreate",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Webhook Creado",
      description: `Se ha creado un nuevo webhook`,
      timestamp: new Date(),
      fields: [],
      color: 0x00ff00,
      footer: { text: `Creado por: ${data.executor?.tag || "Desconocido"}` },
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

    if (data.target.avatar) {
      embed.fields.push({
        name: " Avatar",
        value: "Personalizado",
        inline: true
      });
    }

    if (data.target.application_id) {
      embed.fields.push({
        name: " Aplicación",
        value: `ID: \`${data.target.application_id}\``,
        inline: true
      });
    }

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
