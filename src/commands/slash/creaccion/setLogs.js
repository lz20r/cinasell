const Logs = require("../../../models/logs.js");
const { clearCache } = require("../../../tools/isLogEnabled.js");

module.exports = {
  data: {
    name: "set-logs",
    description: "Configura el canal de logs en tu servidor.",
    options: [
      {
        type: 7, // Tipo de opción para seleccionar un canal
        channel_types: [0], // Limitar a canales de texto
        name: "canal",
        description: "Elige el canal donde se enviarán los logs.",
        required: true,
      },
    ],
  },

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Obtener el canal de logs
      const channel = interaction.options.getChannel("canal");

      // Verificar permisos del bot en el canal
      const permissions = channel.permissionsFor(interaction.guild.members.me);
      if (!permissions.has(['SendMessages', 'EmbedLinks'])) {
        return await interaction.followUp({
          content: "❌ No tengo permisos para enviar mensajes y embeds en ese canal.",
          ephemeral: true,
        });
      }

      // Guardar la configuración en la base de datos
      await Logs.upsert({
        guildId: interaction.guild.id,
        logChannel: channel.id,
      });

      // Limpiar cache para este servidor
      clearCache(interaction.guild.id);

      // Confirmación
      await interaction.followUp({
        content: `✅ Canal de logs configurado en <#${channel.id}>.\n📋 Usa \`/logs-status\` para ver el estado del sistema.`,
        ephemeral: true,
      });

      // Enviar mensaje de prueba al canal de logs
      const testEmbed = {
        title: "🎉 Sistema de Logs Configurado",
        description: "El sistema de logs ha sido configurado correctamente en este canal.",
        color: 0x00ff00,
        timestamp: new Date(),
        fields: [
          {
            name: "📊 Eventos que se registrarán",
            value: "Miembros, Mensajes, Canales, Roles, Emojis, Voz y más",
            inline: false
          }
        ],
        footer: { text: `Configurado por: ${interaction.user.tag}` }
      };

      await channel.send({ embeds: [testEmbed] });

    } catch (error) {
      console.error("Error en set-logs:", error);
      await interaction.followUp({
        content: "❌ Ocurrió un error al configurar el canal de logs.",
        ephemeral: true,
      });
    }
  },
};
