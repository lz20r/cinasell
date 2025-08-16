module.exports = {
  name: "autoModerationRuleDelete",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Regla de AutoMod Eliminada",
      description: `Se ha eliminado una regla de automoderación`,
      timestamp: new Date(),
      fields: [],
      color: 0xff0000,
      footer: { text: `Eliminado por: ${data.executor?.tag || "Sistema"}` },
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
      name: " Estado Anterior",
      value: data.target.enabled ? "Estaba habilitada" : "Estaba deshabilitada",
      inline: true
    });

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
