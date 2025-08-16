module.exports = {
  name: "guildMemberPrune",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Purga de Miembros",
      description: `Se ha realizado una purga de miembros inactivos`,
      timestamp: new Date(),
      fields: [],
      color: 0xff6600,
      footer: { text: `Ejecutado por: ${data.executor?.tag || "Desconocido"}` },
    };

    embed.fields.push({
      name: " Miembros Purgados",
      value: `\`${data.target.removed || 0}\` miembros`,
      inline: true
    });

    embed.fields.push({
      name: " Días de Inactividad",
      value: `\`${data.target.days || 0}\` días`,
      inline: true
    });

    if (data.target.compute_prune_count !== undefined) {
      embed.fields.push({
        name: " Conteo Calculado",
        value: data.target.compute_prune_count ? "Sí" : "No",
        inline: true
      });
    }

    if (data.target.include_roles && data.target.include_roles.length > 0) {
      const roles = data.target.include_roles.map(roleId => `<@&${roleId}>`).slice(0, 5);
      embed.fields.push({
        name: " Roles Incluidos",
        value: roles.join(", ") + (data.target.include_roles.length > 5 ? "..." : ""),
        inline: false
      });
    }

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
