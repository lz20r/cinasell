const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: {
    name: "promote",
    description: "Promueve a un usuario al siguiente rango en la jerarquía de staff.",
    options: [
      {
        type: 6, // Tipo User
        name: "usuario",
        description: "El usuario que será promovido.",
        required: true,
      },
    ],
  },

  async execute(interaction, client) {
    // Verificar permisos de administrador
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: " Necesitas permisos de **Administrador** para usar este comando.",
        ephemeral: true,
      });
    }

    const targetUser = interaction.options.getUser("usuario");
    
    // Verificar que no se promueva a sí mismo
    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: " No puedes promoverte a ti mismo.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const config = client.config;
      const hierarchy = config.staffSystem.hierarchy;
      const servers = Object.keys(config.staffSystem.servers);
      
      console.log(` Procesando promoción de ${targetUser.tag}...`);

      // Determinar el rango actual del usuario
      let currentRank = null;
      let currentRankIndex = -1;

      // Buscar en el servidor actual primero
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

      // Si no tiene ningún rol de staff, empezar desde Learner
      if (currentRankIndex === -1) {
        currentRankIndex = -1; // Para que el siguiente sea 0 (Learner)
        currentRank = "Sin rango";
      }

      // Verificar si ya es el rango más alto
      if (currentRankIndex >= hierarchy.length - 1) {
        return interaction.editReply(" Este usuario ya tiene el rango más alto (Community Manager).");
      }

      // Calcular próximo rango
      const nextRankIndex = currentRankIndex + 1;
      const nextRank = hierarchy[nextRankIndex];

      // Verificar que el ejecutor tenga permiso para dar este rango
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

      // Si es owner, puede promover a cualquier rango
      const isOwner = config.owners.includes(interaction.user.id);
      
      if (!isOwner && executorRankIndex < nextRankIndex) {
        return interaction.editReply(` No tienes suficiente rango para promover a **${nextRank}**. Tu rango actual: **${executorRankIndex >= 0 ? hierarchy[executorRankIndex] : 'Sin rango'}**.`);
      }

      console.log(` Promoción autorizada: ${currentRank}  ${nextRank}`);

      // Realizar la promoción en todos los servidores
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
          // Remover rol anterior si existe
          if (currentRankIndex >= 0) {
            const oldRoleId = serverRoles[currentRank];
            if (oldRoleId && member.roles.cache.has(oldRoleId)) {
              await member.roles.remove(oldRoleId, `Promoción de ${currentRank} a ${nextRank} por ${interaction.user.tag}`);
            }
          }

          // Agregar nuevo rol
          const newRoleId = serverRoles[nextRank];
          if (newRoleId) {
            await member.roles.add(newRoleId, `Promoción de ${currentRank} a ${nextRank} por ${interaction.user.tag}`);
            results.push(` **${guild.name}:** Promovido exitosamente`);
            successCount++;
          } else {
            results.push(` **${guild.name}:** Rol ${nextRank} no encontrado`);
          }

        } catch (error) {
          console.error(`Error promoviendo en ${guild.name}:`, error);
          results.push(` **${guild.name}:** Error - ${error.message}`);
        }
      }

      // Crear embed de resultado
      const embed = {
        title: " Promoción de Staff",
        description: `**${targetUser.tag}** ha sido promovido de **${currentRank}** a **${nextRank}**`,
        color: successCount > 0 ? 0x00ff00 : 0xff0000,
        fields: [
          {
            name: " Usuario",
            value: `${targetUser} (${targetUser.tag})`,
            inline: true
          },
          {
            name: " Cambio de Rango",
            value: `${currentRank}  **${nextRank}**`,
            inline: true
          },
          {
            name: " Promovido por",
            value: `${interaction.user.tag}`,
            inline: true
          },
          {
            name: " Resultados por Servidor",
            value: results.join('\n') || "Sin resultados",
            inline: false
          }
        ],
        timestamp: new Date(),
        footer: {
          text: `Promociones exitosas: ${successCount}/${servers.length}`,
          icon_url: client.user.displayAvatarURL()
        }
      };

      await interaction.editReply({ embeds: [embed] });

      //console.log(` Promoción completada: ${targetUser.tag}  ${nextRank} (${successCount}/${servers.length} servidores)`);

    } catch (error) {
      console.error("Error en promote:", error);
      await interaction.editReply({
        content: " Ocurrió un error durante la promoción.",
      });
    }
  },
};
