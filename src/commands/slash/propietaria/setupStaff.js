const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: {
    name: "setup-staff",
    description: "Configura los roles de staff sincronizados desde el servidor de referencia.",
  },

  async execute(interaction, client) {
    // Solo owners pueden ejecutar este comando
    if (!client.config.owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: " Solo los propietarios del bot pueden usar este comando.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const config = client.config;
      const referenceServerId = config.staffSystem.referenceServer;
      const targetServers = Object.keys(config.staffSystem.servers);
      const hierarchy = config.staffSystem.hierarchy;

      // Obtener el servidor de referencia
      const referenceGuild = client.guilds.cache.get(referenceServerId);
      if (!referenceGuild) {
        return interaction.editReply(" No se puede acceder al servidor de referencia.");
      }

      console.log(" Analizando roles del servidor de referencia...");

      // Obtener roles de referencia
      const referenceRoles = {};
      for (const roleName of hierarchy) {
        const role = referenceGuild.roles.cache.find(r => r.name === roleName);
        if (role) {
          referenceRoles[roleName] = {
            id: role.id,
            name: role.name,
            color: role.color,
            permissions: role.permissions.bitfield.toString(),
            position: role.position,
            mentionable: role.mentionable,
            hoist: role.hoist
          };
        }
      }

      console.log(` Encontrados ${Object.keys(referenceRoles).length} roles de referencia`);

      // Actualizar config con roles de referencia
      config.staffSystem.servers[referenceServerId] = {};
      for (const [roleName, roleData] of Object.entries(referenceRoles)) {
        config.staffSystem.servers[referenceServerId][roleName] = roleData.id;
      }

      let setupResults = [];
      setupResults.push(` **Servidor de Referencia:** ${referenceGuild.name}`);
      setupResults.push(` **${referenceGuild.name}:** ${Object.keys(referenceRoles).length} roles mapeados`);

      // Configurar otros servidores
      for (const serverId of targetServers) {
        if (serverId === referenceServerId) continue;

        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
          setupResults.push(` **${serverId}:** No accesible`);
          config.staffSystem.servers[serverId] = {};
          continue;
        }

        console.log(` Configurando servidor: ${guild.name}`);
        
        let serverRoles = {};
        let createdCount = 0;
        let updatedCount = 0;

        // Procesar cada rol en orden jerárquico (del más bajo al más alto)
        for (let i = 0; i < hierarchy.length; i++) {
          const roleName = hierarchy[i];
          const referenceRole = referenceRoles[roleName];
          
          if (!referenceRole) {
            console.warn(` Rol de referencia "${roleName}" no encontrado`);
            continue;
          }

          // Buscar si el rol ya existe
          let existingRole = guild.roles.cache.find(r => r.name === roleName);

          if (existingRole) {
            // Actualizar rol existente
            try {
              await existingRole.edit({
                color: referenceRole.color,
                permissions: referenceRole.permissions,
                mentionable: referenceRole.mentionable,
                hoist: referenceRole.hoist
              });
              serverRoles[roleName] = existingRole.id;
              updatedCount++;
              console.log(` Actualizado: ${roleName}`);
            } catch (error) {
              console.error(`Error actualizando ${roleName}:`, error);
            }
          } else {
            // Crear nuevo rol
            try {
              const newRole = await guild.roles.create({
                name: referenceRole.name,
                color: referenceRole.color,
                permissions: referenceRole.permissions,
                mentionable: referenceRole.mentionable,
                hoist: referenceRole.hoist,
                reason: "Setup automático de roles de staff"
              });
              
              serverRoles[roleName] = newRole.id;
              createdCount++;
              console.log(` Creado: ${roleName}`);
            } catch (error) {
              console.error(`Error creando ${roleName}:`, error);
            }
          }
        }

        // Reordenar roles correctamente: Community Manager arriba, Learner abajo
        console.log(` Reordenando roles en ${guild.name}...`);
        
        // Obtener el rol más alto del servidor (owner/admin roles)
        const highestRole = guild.roles.cache
          .filter(r => !r.managed && r.name !== '@everyone')
          .sort((a, b) => b.position - a.position)
          .first();
        
        let basePosition = highestRole ? highestRole.position : guild.roles.cache.size;
        
        // Reordenar desde Community Manager (más alto) hasta Learner (más bajo)
        for (let i = hierarchy.length - 1; i >= 0; i--) {
          const roleName = hierarchy[i];
          const roleId = serverRoles[roleName];
          
          if (roleId) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
              try {
                // Community Manager será el más alto de staff, Learner el más bajo
                const targetPosition = basePosition - (hierarchy.length - i);
                await role.setPosition(Math.max(1, targetPosition));
                console.log(` ${roleName} posicionado en: ${targetPosition}`);
                
                // Pequeña pausa para evitar rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
              } catch (error) {
                console.error(`Error reordenando ${roleName}:`, error);
              }
            }
          }
        }

        // Actualizar config con los IDs de los roles de este servidor
        config.staffSystem.servers[serverId] = serverRoles;
        setupResults.push(` **${guild.name}:** ${createdCount} creados, ${updatedCount} actualizados`);
      }

      // Guardar configuración actualizada en config.json
      const configPath = path.join(process.cwd(), 'config.json');
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
      
      // Actualizar config en memoria del cliente
      client.config = config;

      console.log(" Configuración guardada exitosamente en config.json");

      // Mostrar los IDs actualizados en el embed
      let configPreview = [];
      for (const [serverId, roles] of Object.entries(config.staffSystem.servers)) {
        const guild = client.guilds.cache.get(serverId);
        const guildName = guild ? guild.name : serverId;
        const roleCount = Object.keys(roles).length;
        configPreview.push(`**${guildName}:** ${roleCount} roles configurados`);
      }

      const embed = {
        title: " Setup de Staff Completado",
        description: "Sistema de roles de staff configurado con **jerarquía correcta** (Community Manager arriba  Learner abajo) y **config.json actualizado automáticamente**.",
        color: 0x00ff00,
        fields: [
          {
            name: " Resultados por Servidor",
            value: setupResults.join('\n'),
            inline: false
          },
          {
            name: " Config.json Actualizado",
            value: configPreview.join('\n'),
            inline: false
          },
          {
            name: " Jerarquía (Mayor  Menor)",
            value: `**Más Alto:** ${hierarchy[hierarchy.length - 1]}\n${hierarchy.slice().reverse().slice(1, -1).map(role => ` ${role}`).join('\n')}\n**Más Bajo:** ${hierarchy[0]}`,
            inline: false
          }
        ],
        timestamp: new Date(),
        footer: {
          text: `Configurado por: ${interaction.user.tag} | Jerarquía corregida`,
          icon_url: interaction.user.displayAvatarURL()
        }
      };

      await interaction.editReply({ embeds: [embed] });

      // Log detallado de la configuración actualizada
      console.log(" Config.json actualizado con los siguientes IDs:");
      console.log(" Orden jerárquico (de mayor a menor):");
      for (const [serverId, roles] of Object.entries(config.staffSystem.servers)) {
        const guild = client.guilds.cache.get(serverId);
        const guildName = guild ? guild.name : serverId;
        console.log(`\n ${guildName} (${serverId}):`);
        
        // Mostrar en orden jerárquico correcto (de mayor a menor)
        for (let i = hierarchy.length - 1; i >= 0; i--) {
          const roleName = hierarchy[i];
          const roleId = roles[roleName];
          if (roleId) {
            console.log(`  ${i + 1}. ${roleName}: ${roleId}`);
          }
        }
      }

    } catch (error) {
      console.error("Error en setup-staff:", error);
      await interaction.editReply({
        content: " Ocurrió un error durante la configuración del sistema de staff.",
      });
    }
  },
};
