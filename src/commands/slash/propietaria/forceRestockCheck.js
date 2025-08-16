module.exports = {
  data: {
    name: "force-restock-check",
    description: "Fuerza una verificación inmediata de restock.",
  },

  async execute(interaction) {
    // Solo para propietarios/administradores
    if (!interaction.member.permissions.has("Administrator")) {
      return await interaction.reply({
        content: "❌ Solo los administradores pueden usar este comando.",
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      const monitor = interaction.client.restockMonitor;
      
      if (!monitor) {
        const embed = {
          title: "❌ Monitor No Disponible",
          description: "El sistema de restock no está inicializado.",
          color: 0xff0000,
          timestamp: new Date()
        };
        return await interaction.followUp({ embeds: [embed] });
      }

      const embed = {
        title: "🔄 Verificando Restock...",
        description: "Ejecutando verificación manual del stock de productos.",
        color: 0x00aaff,
        timestamp: new Date(),
        fields: [
          {
            name: "⏱️ Estado",
            value: "Verificando productos...",
            inline: false
          }
        ]
      };

      await interaction.followUp({ embeds: [embed] });

      // Ejecutar verificación
      await monitor.checkRestock();

      const successEmbed = {
        title: "✅ Verificación Completada",
        description: "La verificación de restock se ha ejecutado correctamente.",
        color: 0x00ff00,
        timestamp: new Date(),
        fields: [
          {
            name: "📊 Resultado",
            value: "Todos los productos han sido verificados",
            inline: false
          },
          {
            name: "🔔 Notificaciones",
            value: "Si se detectó restock, las notificaciones se enviaron automáticamente",
            inline: false
          }
        ],
        footer: {
          text: "Sistema de Restock • Cinasell"
        }
      };

      // Editar el mensaje original después de un breve delay
      setTimeout(async () => {
        try {
          await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
          console.error("Error editando mensaje:", error);
        }
      }, 2000);

    } catch (error) {
      console.error("Error en force-restock-check:", error);
      
      const errorEmbed = {
        title: "❌ Error en Verificación",
        description: "Hubo un error al ejecutar la verificación de restock.",
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

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
