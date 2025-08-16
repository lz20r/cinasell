module.exports = {
  data: {
    name: "staff-info",
    description: "Muestra información del rango de staff de un usuario.",
    options: [
      {
        type: 6, // Tipo User
        name: "usuario",
        description: "El usuario del cual ver la información de staff.",
        required: false,
      },
    ],
  },

  async execute(interaction, client) {
    const targetUser = interaction.options.getUser("usuario") || interaction.user;
    
    try {
      const config = client.config;
      const hierarchy = config.staffSystem.hierarchy;
      const servers = Object.keys(config.staffSystem.servers);
      
      let userRanks = {};
      let highestRank = null;
      let highestRankIndex = -1;

      // Verificar rango en cada servidor
      for (const serverId of servers) {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
          userRanks[serverId] = { guildName: serverId, rank: "Servidor no accesible", inGuild: false };
          continue;
        }

        const member = guild.members.cache.get(targetUser.id);
        if (!member) {
          userRanks[serverId] = { guildName: guild.name, rank: "No está en el servidor", inGuild: false };
          continue;
        }

        const serverRoles = config.staffSystem.servers[serverId];
        if (!serverRoles) {
          userRanks[serverId] = { guildName: guild.name, rank: "Servidor no configurado", inGuild: true };
          continue;
        }

        // Buscar el rango más alto en este servidor
        let serverRank = "Sin rango de staff";
        let serverRankIndex = -1;

        for (let i = hierarchy.length - 1; i >= 0; i--) {
          const rankName = hierarchy[i];
          const roleId = serverRoles[rankName];
          
          if (roleId && member.roles.cache.has(roleId)) {
            serverRank = rankName;
            serverRankIndex = i;
            break;
          }
        }

        userRanks[serverId] = { guildName: guild.name, rank: serverRank, inGuild: true, rankIndex: serverRankIndex };

        // Actualizar el rango más alto global
        if (serverRankIndex > highestRankIndex) {
          highestRank = serverRank;
          highestRankIndex = serverRankIndex;
        }
      }

      // Crear embed
      const embed = {
        title: " Información de Staff",
        description: `Información del sistema de staff para **${targetUser.tag}**`,
        color: highestRankIndex >= 0 ? 0x00ff00 : 0x95a5a6,
        fields: [
          {
            name: " Usuario",
            value: `${targetUser} (${targetUser.tag})`,
            inline: true
          },
          {
            name: " Rango Más Alto",
            value: highestRank || "Sin rango de staff",
            inline: true
          },
          {
            name: " Posición en Jerarquía",
            value: highestRankIndex >= 0 ? `${highestRankIndex + 1} de ${hierarchy.length}` : "N/A",
            inline: true
          }
        ],
        timestamp: new Date(),
        footer: {
          text: `Consultado por: ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL()
        }
      };

      // Agregar información por servidor
      let serverInfo = [];
      for (const [serverId, info] of Object.entries(userRanks)) {
        const status = info.inGuild ? (info.rankIndex >= 0 ? "" : "") : "";
        serverInfo.push(`${status} **${info.guildName}:** ${info.rank}`);
      }

      if (serverInfo.length > 0) {
        embed.fields.push({
          name: " Estado por Servidor",
          value: serverInfo.join('\n'),
          inline: false
        });
      }

      // Agregar jerarquía completa si el usuario tiene algún rango
      if (highestRankIndex >= 0) {
        const hierarchyDisplay = hierarchy.map((rank, index) => {
          const symbol = index === highestRankIndex ? "" : (index < highestRankIndex ? "" : "");
          return `${symbol} ${index + 1}. ${rank}`;
        });

        embed.fields.push({
          name: " Jerarquía Completa",
          value: hierarchyDisplay.join('\n'),
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("Error en staff-info:", error);
      await interaction.reply({
        content: " Ocurrió un error al obtener la información de staff.",
        ephemeral: true,
      });
    }
  },
};
