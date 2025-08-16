const AutoRole = require("../../../models/autoRole");

module.exports = {
  data: {
    name: "disable-autorol",
    description: "Desactiva el sistema de autorol del servidor.",
  },

  async execute(interaction) {
    // Verificar permisos de administrador
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: " Necesitas permisos de **Administrador** para usar este comando.",
        ephemeral: true,
      });
    }

    const guildId = interaction.guild.id;

    try {
      // Buscar la configuración actual del autorol
      const autoRole = await AutoRole.findOne({
        where: { guildId: guildId }
      });

      if (!autoRole) {
        return interaction.reply({
          content: " No hay ningún sistema de autorol configurado en este servidor.",
          ephemeral: true,
        });
      }

      // Eliminar la configuración del autorol
      await autoRole.destroy();

      // Respuesta de éxito
      const embed = {
        title: " Sistema de Autorol Desactivado",
        description: "El sistema de autorol ha sido completamente desactivado. Los nuevos miembros ya no recibirán roles automáticamente.",
        color: 0xff6b6b,
        timestamp: new Date(),
        fields: [
          {
            name: " Estado",
            value: " Desactivado",
            inline: true
          },
          {
            name: " Acción realizada",
            value: "Configuración eliminada",
            inline: true
          }
        ],
        footer: { 
          text: `Desactivado por: ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL()
        }
      };

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("Error en disable-autorol:", error);
      await interaction.reply({
        content: " Ocurrió un error al desactivar el autorol.",
        ephemeral: true,
      });
    }
  },
};
