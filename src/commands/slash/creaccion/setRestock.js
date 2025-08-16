const RestockChannel = require("../../../models/restockChannel.js");

module.exports = {
  data: {
    name: "set-restock",
    description: "Configura el canal para notificaciones automáticas de restock.",
    options: [
      {
        type: 7, // Channel
        name: "canal",
        description: "Canal donde se enviarán las notificaciones de restock",
        required: true,
      },
      {
        type: 8, // Role
        name: "rol",
        description: "Rol a mencionar cuando haya restock (opcional)",
        required: false,
      },
    ],
  },

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const channel = interaction.options.getChannel("canal");
      const role = interaction.options.getRole("rol");

      // Verificar permisos en el canal
      if (!channel.permissionsFor(interaction.guild.members.me).has(["SendMessages", "EmbedLinks"])) {
        const errorEmbed = {
          title: "❌ Sin Permisos",
          description: `No tengo permisos para enviar mensajes en ${channel}`,
          color: 0xff0000,
          timestamp: new Date(),
          fields: [
            {
              name: "🔧 Permisos Necesarios",
              value: "• Enviar Mensajes\n• Insertar Enlaces",
              inline: false
            }
          ]
        };

        return await interaction.followUp({ embeds: [errorEmbed] });
      }

      // Guardar configuración
      await RestockChannel.upsert({
        guildId: interaction.guild.id,
        channelId: channel.id,
        roleId: role?.id || null,
        enabled: true
      });

      const embed = {
        title: "✅ Canal de Restock Configurado",
        description: `Las notificaciones automáticas de restock se enviarán a ${channel}`,
        color: 0x00ff00,
        timestamp: new Date(),
        fields: [
          {
            name: "📢 Canal",
            value: `${channel}`,
            inline: true
          },
          {
            name: "🔔 Mencionar Rol",
            value: role ? `${role}` : "Ninguno",
            inline: true
          },
          {
            name: "🛒 Tienda",
            value: `[Cinasell](https://cinasell.es)`,
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
            name: "🎯 Estado",
            value: "✅ Activo",
            inline: true
          }
        ],
        footer: {
          text: "Sistema de Restock Automático • Cinasell"
        }
      };

      await interaction.followUp({ embeds: [embed] });

      // Enviar mensaje informativo al canal configurado
      const infoEmbed = {
        title: "🎉 Notificaciones de Restock Configuradas",
        description: "Este canal recibirá notificaciones automáticas cuando haya restock en la tienda Cinasell.",
        color: 0x00aaff,
        timestamp: new Date(),
        fields: [
          {
            name: "⏱️ Verificación",
            value: "Cada 1 minuto",
            inline: true
          },
          {
            name: "🛍️ Productos",
            value: "Todos los servicios",
            inline: true
          }
        ],
        footer: {
          text: "Sistema de Restock • Cinasell"
        }
      };

      await channel.send({ embeds: [infoEmbed] });

    } catch (error) {
      console.error("Error en set-restock:", error);
      
      const errorEmbed = {
        title: "❌ Error de Configuración",
        description: "Hubo un error al configurar el canal de restock.",
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
