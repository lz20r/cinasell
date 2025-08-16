const Logs = require("../../../models/logs.js");

module.exports = {
  data: {
    name: "logs-status",
    description: "Muestra el estado del sistema de logs en tu servidor.",
  },

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Buscar configuración de logs para este servidor
      const logsConfig = await Logs.findOne({ 
        where: { guildId: interaction.guild.id } 
      });

      const embed = {
        title: "📋 Estado del Sistema de Logs",
        color: logsConfig ? 0x00ff00 : 0xff0000,
        timestamp: new Date(),
        fields: []
      };

      if (logsConfig) {
        const logChannel = interaction.guild.channels.cache.get(logsConfig.logChannel);
        
        embed.description = "✅ El sistema de logs está **activado**";
        embed.fields.push({
          name: "📺 Canal de logs",
          value: logChannel ? `<#${logsConfig.logChannel}>` : "⚠️ Canal no encontrado",
          inline: true
        });

        // Verificar permisos del bot en el canal
        if (logChannel) {
          const permissions = logChannel.permissionsFor(interaction.guild.members.me);
          const hasPermissions = permissions.has(['SendMessages', 'EmbedLinks']);
          
          embed.fields.push({
            name: "🔐 Permisos",
            value: hasPermissions ? "✅ Correctos" : "❌ Sin permisos necesarios",
            inline: true
          });
        }
        
        embed.fields.push({
          name: "📊 Eventos registrados",
          value: "23 tipos de eventos disponibles",
          inline: true
        });

      } else {
        embed.description = "❌ El sistema de logs está **desactivado**";
        embed.fields.push({
          name: "🔧 Configuración",
          value: "Usa `/set-logs` para configurar un canal de logs",
          inline: false
        });
      }

      // Lista de eventos disponibles
      embed.fields.push({
        name: "📝 Eventos disponibles",
        value: `
        **👥 Miembros:** Unirse, Salir, Actualización
        **🔨 Moderación:** Baneos, Desbaneos
        **💬 Mensajes:** Eliminación, Edición
        **📺 Canales:** Creación, Eliminación, Actualización
        **🧵 Hilos:** Creación, Eliminación, Actualización
        **🎭 Roles:** Creación, Eliminación, Actualización
        **😀 Emojis:** Creación, Eliminación, Actualización
        **🏰 Servidor:** Cambios de configuración
        **📨 Invitaciones:** Creación, Eliminación
        **🔊 Voz:** Estados de voz`,
        inline: false
      });

      await interaction.followUp({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error("Error en logs-status:", error);
      await interaction.followUp({
        content: "❌ Ocurrió un error al verificar el estado de los logs.",
        ephemeral: true
      });
    }
  },
};
