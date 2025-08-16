module.exports = {
    name: "channelUpdate",

    load(data, channel, client) {
      const guild = client.guilds.cache.get(data.guild?.id);
      const embed = {
        author: {
          name: guild?.name || "Servidor desconocido",
          icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
        },
        title: " Canal Actualizado",
        description: `Se ha actualizado el canal <#${data.target.id}>`,
        timestamp: new Date(),
        fields: [],
        color: 0xffff00,
        footer: { text: `Cambiado por: ${data.executor?.tag || "Sistema"}` },
      };
  
      for (const change of data.changes) {
        const field = {};
  
        switch (change.key) {
          case "name":
            field.name = " Nombre";
            field.value = `Antiguo: \`${change.old}\`\nNuevo: \`${change.new}\``;
            break;
  
          case "topic":
            field.name = " Tema";
            field.value = `Antiguo: \`${change.old || "Sin tema"}\`\nNuevo: \`${change.new || "Sin tema"}\``;
            break;
  
          case "nsfw":
            field.name = " NSFW";
            field.value = `Antiguo: ${change.old ? "Sí" : "No"}\nNuevo: ${change.new ? "Sí" : "No"}`;
            break;
  
          case "rateLimitPerUser":
            field.name = " Modo Lento";
            field.value = `Antiguo: ${change.old || 0} segundos\nNuevo: ${change.new || 0} segundos`;
            break;
  
          case "bitrate":
            field.name = " Bitrate";
            field.value = `Antiguo: ${change.old || 0} kbps\nNuevo: ${change.new || 0} kbps`;
            break;
  
          case "userLimit":
            field.name = " Límite de Usuarios";
            field.value = `Antiguo: ${change.old || "Sin límite"}\nNuevo: ${change.new || "Sin límite"}`;
            break;
            
          case "type":
            field.name = " Tipo de Canal";
            const channelTypes = {
              0: "Texto",
              1: "Mensaje Directo",
              2: "Voz",
              3: "Mensaje Directo Grupal",
              4: "Categoría",
              5: "Anuncios",
              10: "Hilo de Anuncios",
              11: "Hilo Público",
              12: "Hilo Privado",
              13: "Voz de Escenario",
              15: "Foro"
            };
            field.value = `Antiguo: ${channelTypes[change.old] || change.old}\nNuevo: ${channelTypes[change.new] || change.new}`;
            break;
            
          case "parentId":
            field.name = " Categoría";
            const oldCategory = change.old ? guild.channels.cache.get(change.old)?.name || change.old : "Sin categoría";
            const newCategory = change.new ? guild.channels.cache.get(change.new)?.name || change.new : "Sin categoría";
            field.value = `Antigua: ${oldCategory}\nNueva: ${newCategory}`;
            break;
            
          case "rtcRegion":
            field.name = " Región RTC";
            field.value = `Antigua: ${change.old || "Automática"}\nNueva: ${change.new || "Automática"}`;
            break;
            
          case "videoQualityMode":
            field.name = " Calidad de Video";
            const qualityModes = {
              1: "Automática",
              2: "720p"
            };
            field.value = `Antigua: ${qualityModes[change.old] || change.old}\nNueva: ${qualityModes[change.new] || change.new}`;
            break;
            
          case "position":
            field.name = " Posición";
            field.value = `Antigua: ${change.old}\nNueva: ${change.new}`;
            break;
  
          case "permissionOverwrites":
            field.name = " Permisos";
            field.value = "Los permisos del canal han sido actualizados";
            break;
  
          default:
            field.name = ` ${change.key}`;
            field.value = `Antiguo: \`${change.old}\`\nNuevo: \`${change.new}\``;
            break;
        }
  
        embed.fields.push(field);
      }
  
      if (embed.fields.length > 0) {
        client.channels.cache.get(channel).send({ embeds: [embed] });
      }
    }
  };
