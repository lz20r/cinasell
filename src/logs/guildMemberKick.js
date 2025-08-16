module.exports = {
  name: "guildMemberKick",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Miembro Expulsado",
      description: `Se ha expulsado un miembro del servidor`,
      timestamp: new Date(),
      fields: [],
      color: 0xff9500,
      footer: { text: `Expulsado por: ${data.executor?.tag || "Desconocido"}` },
    };

    embed.fields.push({
      name: " Usuario Expulsado",
      value: `${data.target.tag} (<@${data.target.id}>)`,
      inline: true
    });

    embed.fields.push({
      name: " ID del Usuario",
      value: `\`${data.target.id}\``,
      inline: true
    });

    if (data.reason) {
      embed.fields.push({
        name: " Razón",
        value: data.reason,
        inline: false
      });
    }

    embed.fields.push({
      name: " Fecha de Unión",
      value: data.target.joined_at ? `<t:${Math.floor(new Date(data.target.joined_at).getTime() / 1000)}:F>` : "Desconocida",
      inline: true
    });

    if (data.target.nick) {
      embed.fields.push({
        name: " Apodo en el Servidor",
        value: `\`${data.target.nick}\``,
        inline: true
      });
    }

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
