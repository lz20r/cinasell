module.exports = {
  data: {
    name: "remove-staff",
    description: "Remueve todos los roles de staff de un usuario.",
    options: [
      {
        type: 6, // Tipo User
        name: "usuario",
        description: "El usuario al que se le removerán los roles de staff.",
        required: true,
      },
    ],
  },

  async execute(interaction, client) {
    // Verificar permisos - Owners del bot siempre pueden usar el comando
    const isOwner = client.config.owners.includes(interaction.user.id);
    
    if (!isOwner && !interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: " Necesitas permisos de **Administrador** para usar este comando.",
        ephemeral: true,
      });
    }

    const targetUser = interaction.options.getUser("usuario");
    
    // Verificar que no se remueva a sí mismo (excepto owners)
    if (!isOwner && targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: " No puedes removerte a ti mismo del staff.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const config = client.config;
      const hierarchy = config.staffSystem.hierarchy;
      const servers = Object.keys(config.staffSystem.servers);
      
      console.log(` Procesando remoción de staff de ${targetUser.tag}...`);

      // Determinar el rango actual del usuario en el servidor actual
      let currentRank = null;
      let currentRankIndex = -1;

      const currentGuild = interaction.guild;
      const targetMember = currentGuild.members.cache.get(targetUser.id);
      
      if (!targetMember) {
        return interaction.editReply(" El usuario no está en este servidor.");
      }

      // Obtener roles de staff del servidor actual
      const currentServerRoles = config.staffSystem.servers[currentGuild.id];
      if (!currentServerRoles) {
        return interaction.editReply(" Este servidor no tiene configurado el sistema de staff. Usa `/setup-staff` primero.");
      }

      // Encontrar el rango más alto actual
      for (let i = hierarchy.length - 1; i >= 0; i--) {
        const rankName = hierarchy[i];
        const roleId = currentServerRoles[rankName];
        
        if (roleId && targetMember.roles.cache.has(roleId)) {
          currentRank = rankName;
          currentRankIndex = i;
          break;
        }
      }

      // Si no tiene ningún rol de staff
      if (currentRankIndex === -1) {
        return interaction.editReply(" Este usuario no tiene ningún rol de staff.");
      }

      // Verificar que el ejecutor tenga permiso para remover este rango (solo si no es owner)
      if (!isOwner) {
        const executorMember = interaction.member;
        let executorRankIndex = -1;

        for (let i = hierarchy.length - 1; i >= 0; i--) {
          const rankName = hierarchy[i];
          const roleId = currentServerRoles[rankName];
          
          if (roleId && executorMember.roles.cache.has(roleId)) {
            executorRankIndex = i;
            break;
          }
        }

        if (executorRankIndex < currentRankIndex) {
          return interaction.editReply(` No tienes suficiente rango para remover a **${currentRank}**. Tu rango actual: **${executorRankIndex >= 0 ? hierarchy[executorRankIndex] : 'Sin rango'}**.`);
        }
      }

      console.log(` Remoción autorizada: ${currentRank}  Sin staff`);

      // Realizar la remoción en todos los servidores
      let results = [];
      let successCount = 0;

      for (const serverId of servers) {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
          results.push(` **${serverId}:** Servidor no accesible`);
          continue;
        }

        const member = guild.members.cache.get(targetUser.id);
        if (!member) {
          results.push(` **${guild.name}:** Usuario no está en el servidor`);
          continue;
        }

        const serverRoles = config.staffSystem.servers[serverId];
        if (!serverRoles) {
          results.push(` **${guild.name}:** No configurado`);
          continue;
        }

        try {
          let removedRoles = [];
          
          // Remover todos los roles de staff
          for (const rankName of hierarchy) {
            const roleId = serverRoles[rankName];
            if (roleId && member.roles.cache.has(roleId)) {
              await member.roles.remove(roleId, `Remoción de staff por ${interaction.user.tag}`);
              removedRoles.push(rankName);
            }
          }

          if (removedRoles.length > 0) {
            results.push(` **${guild.name}:** Removidos ${removedRoles.length} roles`);
            successCount++;
          } else {
            results.push(` **${guild.name}:** Sin roles de staff que remover`);
          }

        } catch (error) {
          console.error(`Error removiendo staff en ${guild.name}:`, error);
          results.push(` **${guild.name}:** Error - ${error.message}`);
        }
      }

      // Crear embed de respuesta
      const embed = {
        title: successCount > 0 ? " Staff Removido" : " Remoción Fallida",
        description: `**Usuario:** ${targetUser}\n**Rango anterior:** ${currentRank}\n**Ejecutado por:** ${interaction.user}${isOwner ? ' ' : ''}`,
        color: successCount > 0 ? 0xff9500 : 0xff0000,
        fields: [
          {
            name: " Resultados por Servidor",
            value: results.join('\n') || "Sin resultados",
            inline: false
          },
          {
            name: " Resumen",
            value: ` **Exitosos:** ${successCount}/${servers.length}\n **Fallidos:** ${servers.length - successCount}/${servers.length}`,
            inline: true
          }
        ],
        timestamp: new Date(),
        footer: {
          text: `Sistema de Staff  ${isOwner ? 'Owner Override' : 'Admin Command'}`,
          icon_url: client.user.displayAvatarURL()
        }
      };

      await interaction.editReply({ embeds: [embed] });

      // Log detallado
      console.log(` Remoción de staff completada:`);
      console.log(` Usuario: ${targetUser.tag} (${targetUser.id})`);
      console.log(` Ejecutor: ${interaction.user.tag} (${interaction.user.id})${isOwner ? ' [OWNER]' : ''}`);
      console.log(` Rango removido: ${currentRank}`);
      console.log(` Servidores exitosos: ${successCount}/${servers.length}`);

    } catch (error) {
      console.error("Error en remove-staff:", error);
      await interaction.editReply({
        content: " Ocurrió un error durante la remoción de staff.",
      });
    }
  },
};
