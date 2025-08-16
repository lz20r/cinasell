const RestockChannel = require("../../../models/restockChannel.js");

module.exports = {
  data: {
    name: "restock-status",
    description: "Muestra el estado del sistema de restock automático.",
  },

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const config = await RestockChannel.findOne({
        where: { 
          guildId: interaction.guild.id,
          enabled: true 
        }
      });

      if (!config) {
        const embed = {
          title: "⚠️ Sistema de Restock No Configurado",
          description: "No hay un canal configurado para las notificaciones de restock automático.",
          color: 0xff9900,
          timestamp: new Date(),
          fields: [
            {
              name: "🔧 Configurar",
              value: "Usa `/set-restock` para configurar un canal",
              inline: false
            },
            {
              name: "ℹ️ Información",
              value: "El sistema revisa automáticamente cada minuto si hay nuevos productos en stock",
              inline: false
            }
          ],
          footer: {
            text: "Sistema de Restock • Cinasell"
          }
        };

        return await interaction.followUp({ embeds: [embed] });
      }

      const channel = interaction.guild.channels.cache.get(config.channelId);
      const role = config.roleId ? interaction.guild.roles.cache.get(config.roleId) : null;

      const embed = {
        title: "📊 Estado del Sistema de Restock",
        description: "Información del sistema de notificaciones automáticas",
        color: 0x00ff00,
        timestamp: new Date(),
        fields: [
          {
            name: "📢 Canal Configurado",
            value: channel ? `${channel}` : "❌ Canal no encontrado",
            inline: true
          },
          {
            name: "🔔 Rol a Mencionar",
            value: role ? `${role}` : "Ninguno",
            inline: true
          },
          {
            name: "🎯 Estado",
            value: config.enabled ? "✅ Activo" : "❌ Desactivado",
            inline: true
          },
          {
            name: "⏰ Frecuencia",
            value: "Cada 1 minuto",
            inline: true
          },
          {
            name: "📊 Monitoreo",
            value: "Todos los productos",
            inline: true
          },
          {
            name: "🛒 Tienda",
            value: `[Cinasell](https://cinasell.es)`,
            inline: true
          },
          {
            name: "ℹ️ Funcionamiento",
            value: "El bot revisa automáticamente el stock de todos los productos y envía una notificación cuando detecta que se han añadido unidades",
            inline: false
          }
        ],
        footer: {
          text: "Sistema de Restock Automático • Cinasell"
        }
      };

      await interaction.followUp({ embeds: [embed] });

    } catch (error) {
      console.error("Error en restock-status:", error);
      
      const errorEmbed = {
        title: "❌ Error al Obtener Estado",
        description: "Hubo un error al obtener el estado del sistema de restock.",
        color: 0xff0000,
        timestamp: new Date(),
        fields: [
          {
            name: "❌ Error",
            value: error.message || "Error desconocido",
            inline: false
          }
        ]
      };

      await interaction.followUp({ embeds: [errorEmbed] });
    }
  },
};
