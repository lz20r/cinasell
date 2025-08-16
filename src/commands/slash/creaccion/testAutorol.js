const AutoRole = require("../../../models/autoRole");

module.exports = {
  data: {
    name: "test-autorol",
    description: "Prueba el sistema de autorol asignándote el rol configurado (solo para testing).",
  },

  async execute(interaction) {
    // Solo administradores pueden probar el autorol
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: " Necesitas permisos de **Administrador** para usar este comando.",
        ephemeral: true,
      });
    }

    const guildId = interaction.guild.id;

    try {
      const autoRole = await AutoRole.findOne({
        where: { 
          guildId: guildId,
          enabled: true
        }
      });

      if (!autoRole) {
        return interaction.reply({
          content: " No hay ningún sistema de autorol configurado en este servidor.",
          ephemeral: true,
        });
      }

      const role = interaction.guild.roles.cache.get(autoRole.roleId);
      if (!role) {
        return interaction.reply({
          content: " El rol configurado ya no existe. Reconfigura el autorol.",
          ephemeral: true,
        });
      }

      // Verificar si ya tiene el rol
      if (interaction.member.roles.cache.has(role.id)) {
        return interaction.reply({
          content: `ℹ Ya tienes el rol **${role.name}** asignado.`,
          ephemeral: true,
        });
      }

      // Verificar que el bot puede asignar el rol
      const botMember = interaction.guild.members.me;
      if (role.position >= botMember.roles.highest.position) {
        return interaction.reply({
          content: " No puedo asignar este rol porque está por encima de mi rol más alto en la jerarquía.",
          ephemeral: true,
        });
      }

      // Asignar el rol
      await interaction.member.roles.add(role, 'Test del sistema de AutoRole');

      const embed = {
        title: " Test de Autorol Completado",
        description: `Se ha asignado exitosamente el rol **${role.name}** para probar el sistema.`,
        color: 0x00ff00,
        fields: [
          {
            name: " Rol asignado",
            value: `${role.toString()} (${role.name})`,
            inline: true
          },
          {
            name: " Estado",
            value: "Funcionando correctamente",
            inline: true
          }
        ],
        timestamp: new Date(),
        footer: { 
          text: `Probado por: ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL()
        }
      };

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error("Error en test-autorol:", error);
      await interaction.reply({
        content: " Ocurrió un error al probar el autorol.",
        ephemeral: true,
      });
    }
  },
};
