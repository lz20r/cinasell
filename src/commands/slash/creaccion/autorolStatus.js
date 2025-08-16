const AutoRole = require("../../../models/autoRole");

module.exports = {
  data: {
    name: "autorol-status",
    description: "Muestra el estado actual del sistema de autorol del servidor.",
  },

  async execute(interaction) {
    // Verificar permisos (pueden ver el estado miembros con ManageRoles o Admin)
    if (!interaction.member.permissions.has("ManageRoles")) {
      return interaction.reply({
        content: " Necesitas permisos de **Gestionar Roles** para usar este comando.",
        ephemeral: true,
      });
    }

    const guildId = interaction.guild.id;

    try {
      const autoRole = await AutoRole.findOne({
        where: { guildId: guildId }
      });

      let embed;

      if (!autoRole) {
        // No hay autorol configurado
        embed = {
          title: " Estado del Sistema de Autorol",
          description: "El sistema de autorol no está configurado en este servidor.",
          color: 0x95a5a6,
          fields: [
            {
              name: " Estado",
              value: " No configurado",
              inline: true
            },
            {
              name: " Acción sugerida",
              value: "Usa `/set-autorol` para configurarlo",
              inline: true
            }
          ],
          timestamp: new Date(),
          footer: { 
            text: `Consultado por: ${interaction.user.tag}`,
            icon_url: interaction.user.displayAvatarURL()
          }
        };
      } else {
        // Verificar si el rol aún existe
        const role = interaction.guild.roles.cache.get(autoRole.roleId);
        const roleExists = !!role;
        const roleName = role ? role.name : " Rol eliminado";
        const roleDisplay = role ? role.toString() : `~~<@&${autoRole.roleId}>~~`;

        embed = {
          title: " Estado del Sistema de Autorol",
          description: roleExists 
            ? "El sistema de autorol está activo y funcionando correctamente."
            : " El sistema está configurado pero el rol ya no existe.",
          color: roleExists ? 0x00ff00 : 0xffa500,
          fields: [
            {
              name: " Estado",
              value: autoRole.enabled && roleExists ? " Activo" : " Con problemas",
              inline: true
            },
            {
              name: " Rol configurado",
              value: `${roleDisplay}\n(${roleName})`,
              inline: true
            },
            {
              name: " Configurado",
              value: `<t:${Math.floor(new Date(autoRole.createdAt).getTime() / 1000)}:R>`,
              inline: true
            }
          ],
          timestamp: new Date(),
          footer: { 
            text: `Consultado por: ${interaction.user.tag}`,
            icon_url: interaction.user.displayAvatarURL()
          }
        };

        if (!roleExists) {
          embed.fields.push({
            name: " Solución",
            value: "Reconfigura el autorol con `/set-autorol` o desactívalo con `/disable-autorol`",
            inline: false
          });
        }
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("Error en autorol-status:", error);
      await interaction.reply({
        content: " Ocurrió un error al obtener el estado del autorol.",
        ephemeral: true,
      });
    }
  },
};
