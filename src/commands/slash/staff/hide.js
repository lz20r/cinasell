const {
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: {
    name: "hide",
    description:
      "Oculta un canal para los miembros / Hide a channel for members"
  },

  async execute(message) {
    // Define los mensajes en ambos idiomas
    const messages = {
      es: {
        noPermission: "-# No tienes permisos para usar este comando.",
        notTextChannel: "-# Solo puedes ocultar canales de texto.",
        success: (channel) =>
          `-# El canal ${channel} ha sido ocultado para todos los miembros.`,
        error: "-# Ocurrió un error al intentar ocultar el canal."
      },
      en: {
        noPermission: "-# You don't have permission to use this command.",
        notTextChannel: "-# You can only hide text channels.",
        success: (channel) =>
          `-# The channel ${channel} has been hidden for all members.`,
        error: "-# An error occurred while trying to hide the channel."
      }
    };

    // Verifica si el usuario tiene permisos de administrador
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply({
        content: messages["es"].noPermission,
        ephemeral: true
      });
    }

    // Crea los botones de idioma
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("es")
        .setLabel("Español")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("en")
        .setLabel("English")
        .setStyle(ButtonStyle.Primary)
    );

    // Envía el mensaje inicial con los botones para seleccionar el idioma
    const sentMessage = await message.reply({
      content:
        "-# ⋆.*ೃ✧   Selecciona tu idioma \n-# ⋆.*ೃ✧   Select your language:",
      components: [row],
      ephemeral: true
    });

    // Crear un filtro para capturar la interacción de botones
    const filter = (interaction) =>
      interaction.isButton() && interaction.user.id === message.author.id;

    // Espera la interacción del usuario
    const collector = sentMessage.createMessageComponentCollector({
      filter,
      time: 15000
    });

    collector.on("collect", async (interaction) => {
      const lang = interaction.customId; // 'es' o 'en'
      await interaction.deferUpdate();

      // Oculta el mensaje de selección de idioma
      await sentMessage.edit({
        content: `-# ⋆.*ೃ✧   Idioma seleccionado: ${
          lang === "es" ? "Español" : "English"
        }`,
        components: [],
        ephemeral: true
      });

      // Obtén el canal a ocultar
      const channel = message.mentions.channels.first() || message.channel;

      // Verifica si el canal es de tipo texto
      if (channel.type !== ChannelType.GuildText) {
        return interaction.followUp({
          content: messages[lang].notTextChannel,
          ephemeral: true
        });
      }

      try {
        // Cambia los permisos del canal para que los miembros no puedan ver el canal
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
          ViewChannel: false
        });

        interaction.followUp({
          content: messages[lang].success(channel),
          ephemeral: true
        });
      } catch (error) {
        console.error(error);
        interaction.followUp({
          content: messages[lang].error,
          ephemeral: true
        });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        sentMessage.edit({
          content:
            "-# ⋆.*ೃ✧   No se seleccionó ningún idioma. \n-# ⋆.*ೃ✧   No language was selected.",
          components: [],
          ephemeral: true
        });
      }
    });
  }
};
