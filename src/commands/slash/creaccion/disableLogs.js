const Logs = require("../../../models/logs.js");
const { clearCache } = require("../../../tools/isLogEnabled.js");

module.exports = {
  data: {
    name: "disable-logs",
    description: "Desactiva el sistema de logs en tu servidor.",
  },

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Verificar si existe configuración de logs
      const logsConfig = await Logs.findOne({ 
        where: { guildId: interaction.guild.id } 
      });

      if (!logsConfig) {
        return await interaction.followUp({
          content: "❌ El sistema de logs no está configurado en este servidor.",
          ephemeral: true,
        });
      }

      // Eliminar la configuración de la base de datos
      await Logs.destroy({
        where: { guildId: interaction.guild.id }
      });

      // Limpiar cache para este servidor
      clearCache(interaction.guild.id);

      // Confirmación
      await interaction.followUp({
        content: "✅ Sistema de logs desactivado correctamente.\n📋 Usa `/set-logs` si quieres reactivarlo.",
        ephemeral: true,
      });

    } catch (error) {
      console.error("Error en disable-logs:", error);
      await interaction.followUp({
        content: "❌ Ocurrió un error al desactivar el sistema de logs.",
        ephemeral: true,
      });
    }
  },
};
