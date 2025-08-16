module.exports = {
  name: "applicationCommandPermissionsUpdate",

  load(data, channel, client) {
    const guild = client.guilds.cache.get(data.guild?.id);
    const embed = {
      author: {
        name: guild?.name || "Servidor desconocido",
        icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
      },
      title: " Permisos de Comando Actualizados",
      description: `Se han actualizado los permisos de un comando de aplicación`,
      timestamp: new Date(),
      fields: [],
      color: 0x0099ff,
      footer: { text: `Actualizado por: ${data.executor?.tag || "Sistema"}` },
    };

    embed.fields.push({
      name: " ID de Aplicación",
      value: `\`${data.target.application_id}\``,
      inline: true
    });

    embed.fields.push({
      name: " ID del Comando",
      value: `\`${data.target.id}\``,
      inline: true
    });

    if (data.target.permissions && data.target.permissions.length > 0) {
      const permissions = data.target.permissions.map(perm => {
        const type = perm.type === 1 ? " Usuario" : perm.type === 2 ? " Rol" : " Canal";
        const permission = perm.permission ? " Permitido" : " Denegado";
        return `${type}: <@${perm.type === 2 ? '&' : ''}${perm.id}> - ${permission}`;
      }).slice(0, 10); // Limitar a 10 para evitar embeds muy largos

      embed.fields.push({
        name: " Permisos Configurados",
        value: permissions.join("\n") + (data.target.permissions.length > 10 ? "\n... y más" : ""),
        inline: false
      });
    }

    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
