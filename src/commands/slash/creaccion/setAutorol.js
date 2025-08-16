const AutoRole = require("../../../models/autoRole");

module.exports = {
  data: {
    name: "set-autorol",
    description: "Configura el rol automático que se dará a nuevos miembros del servidor.",
    options: [
      {
        type: 8, // Tipo Role
        name: "rol",
        description: "El rol que se asignará automáticamente a los nuevos miembros.",
        required: true,
      },
    ],
  },

  async execute(interaction) {
    // Verificar permisos de administrador
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: " Necesitas permisos de **Administrador** para usar este comando.",
        ephemeral: true,
      });
    }

    const role = interaction.options.getRole("rol");
    const guildId = interaction.guild.id;

    // Verificar que el rol existe y es válido
    if (!role) {
      return interaction.reply({
        content: " El rol especificado no es válido.",
        ephemeral: true,
      });
    }

    // Verificar que el bot puede asignar este rol
    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: " No puedo asignar este rol porque está por encima de mi rol más alto en la jerarquía.",
        ephemeral: true,
      });
    }

    // Verificar que el rol no es @everyone
    if (role.id === interaction.guild.id) {
      return interaction.reply({
        content: " No puedes usar el rol @everyone como autorol.",
        ephemeral: true,
      });
    }

    try {
      // Usar upsert para actualizar o crear
      await AutoRole.upsert(
        {
          guildId: guildId,
          roleId: role.id,
          enabled: true,
        },
        { returning: true }
      );

      // Respuesta de éxito
      const embed = {
        title: " Sistema de Autorol Configurado",
        description: `El rol **${role.name}** se asignará automáticamente a todos los nuevos miembros que se unan al servidor.`,
        color: 0x00ff00,
        timestamp: new Date(),
        fields: [
          {
            name: " Rol configurado",
            value: `${role.toString()} (${role.name})`,
            inline: true
          },
          {
            name: " Estado",
            value: " Activado",
            inline: true
          }
        ],
        footer: { 
          text: `Configurado por: ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL()
        }
      };

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("Error en set-autorol:", error);
      await interaction.reply({
        content: " Ocurrió un error al configurar el autorol.",
        ephemeral: true,
      });
    }
  },
};
