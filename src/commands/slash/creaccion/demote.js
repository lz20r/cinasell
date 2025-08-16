const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: {
    name: "demote",
    description: "Degrada a un usuario al rango anterior en la jerarquía de staff.",
    options: [
      {
        type: 6, // Tipo User
        name: "usuario",
        description: "El usuario que será degradado.",
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
    
    // Verificar que no se degrade a sí mismo
    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: " No puedes degradarte a ti mismo.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const config = client.config;
      const hierarchy = config.staffSystem.hierarchy;
      const servers = Object.keys(config.staffSystem.servers);
      
      console.log(` Procesando degradación de ${targetUser.tag}...`);

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

      // Verificar si tiene algún rol de staff
      if (currentRankIndex === -1) {
        return interaction.editReply(" Este usuario no tiene ningún rango de staff para degradar.");
      }

      // Verificar si ya es el rango más bajo
      if (currentRankIndex === 0) {
        return interaction.editReply(" Este usuario ya tiene el rango más bajo (Learner). Usa `/remove-staff` para quitarle todos los roles de staff.");
      }

      // Calcular rango anterior
      const previousRankIndex = currentRankIndex - 1;
      const previousRank = hierarchy[previousRankIndex];

      // Verificar que el ejecutor tenga permiso para degradar este rango
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

      // Si es owner, puede degradar cualquier rango
      const isOwner = config.owners.includes(interaction.user.id);
      
      if (!isOwner && executorRankIndex < currentRankIndex) {
        return interaction.editReply(` No tienes suficiente rango para degradar a **${currentRank}**. Tu rango actual: **${executorRankIndex >= 0 ? hierarchy[executorRankIndex] : 'Sin rango'}**.`);
      }

      console.log(` Degradación autorizada: ${currentRank}  ${previousRank}`);

      // Realizar la degradación en todos los servidores
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
          // Remover rol actual
          const currentRoleId = serverRoles[currentRank];
          if (currentRoleId && member.roles.cache.has(currentRoleId)) {
            await member.roles.remove(currentRoleId, `Degradación de ${currentRank} a ${previousRank} por ${interaction.user.tag}`);
          }

          // Agregar rol anterior
          const previousRoleId = serverRoles[previousRank];
          if (previousRoleId) {
            await member.roles.add(previousRoleId, `Degradación de ${currentRank} a ${previousRank} por ${interaction.user.tag}`);
            results.push(` **${guild.name}:** Degradado exitosamente`);
            successCount++;
          } else {
            results.push(` **${guild.name}:** Rol ${previousRank} no encontrado`);
          }

        } catch (error) {
          console.error(`Error degradando en ${guild.name}:`, error);
          results.push(` **${guild.name}:** Error - ${error.message}`);
        }
      }

      // Crear embed de resultado
      const embed = {
        title: " Degradación de Staff",
        description: `**${targetUser.tag}** ha sido degradado de **${currentRank}** a **${previousRank}**`,
        color: successCount > 0 ? 0xffa500 : 0xff0000,
        fields: [
          {
            name: " Usuario",
            value: `${targetUser} (${targetUser.tag})`,
            inline: true
          },
          {
            name: " Cambio de Rango",
            value: `${currentRank}  **${previousRank}**`,
            inline: true
          },
          {
            name: " Degradado por",
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
          text: `Degradaciones exitosas: ${successCount}/${servers.length}`,
          icon_url: client.user.displayAvatarURL()
        }
      };

      await interaction.editReply({ embeds: [embed] });

      console.log(` Degradación completada: ${targetUser.tag}  ${previousRank} (${successCount}/${servers.length} servidores)`);

    } catch (error) {
      console.error("Error en demote:", error);
      await interaction.editReply({
        content: " Ocurrió un error durante la degradación.",
      });
    }
  },
};
