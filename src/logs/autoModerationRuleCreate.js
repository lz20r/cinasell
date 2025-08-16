module.exports = {
  name: "autoModerationRuleCreate",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Regla de AutoMod Creada",
      description: `Se ha creado una nueva regla de automoderación`,
      timestamp: new Date(),
      fields: [],
      color: 0x00ff00,
      footer: { text: `Creado por: ${data.executor?.tag || "Sistema"}` },
    };

    embed.fields.push({
      name: " Nombre de la Regla",
      value: `\`${data.target.name}\``,
      inline: true
    });

    embed.fields.push({
      name: " ID de la Regla",
      value: `\`${data.target.id}\``,
      inline: true
    });

    embed.fields.push({
      name: " Estado",
      value: data.target.enabled ? "Habilitada" : "Deshabilitada",
      inline: true
    });

    if (data.target.trigger_metadata) {
      const triggers = [];
      if (data.target.trigger_metadata.keyword_filter) {
        triggers.push(`Filtro de palabras clave: ${data.target.trigger_metadata.keyword_filter.length} palabras`);
      }
      if (data.target.trigger_metadata.mention_total_limit) {
        triggers.push(`Límite de menciones: ${data.target.trigger_metadata.mention_total_limit}`);
      }
      if (triggers.length > 0) {
        embed.fields.push({
          name: " Activadores",
          value: triggers.join("\n"),
          inline: false
        });
      }
    }

    if (data.target.actions && data.target.actions.length > 0) {
      const actions = data.target.actions.map(action => {
        switch (action.type) {
          case 1: return "Bloquear mensaje";
          case 2: return "Enviar alerta";
          case 3: return "Timeout al usuario";
          default: return `Acción tipo ${action.type}`;
        }
      });
      embed.fields.push({
        name: " Acciones",
        value: actions.join("\n"),
        inline: false
      });
    }

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
