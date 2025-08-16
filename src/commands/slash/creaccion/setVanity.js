const VanitySettings = require("../../../models/vanity");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: {
    name: "set-vanity",
    description:
      "Establece la configuración de bienvenida para la vanity URL del servidor.",
    options: [
      {
        type: 7,
        channel_types: [0],
        name: "canal",
        description: "Canal para el mensaje de bienvenida de vanity URL.",
        required: true,
      },
      {
        type: 3,
        name: "reaccion",
        description: "Emoji de reacción para el mensaje de bienvenida.",
        required: false,
      },
    ],
  },

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const targetChannel = interaction.options.getChannel("canal");
    const reaction = interaction.options.getString("reaccion");

    // Crear botones para seleccionar el idioma
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("set_message_es")
        .setLabel("Configurar Mensaje en Español")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("set_message_en")
        .setLabel("Configurar Message in English")
        .setStyle(ButtonStyle.Primary)
    );

    // Envía el mensaje de configuración inicial
    await interaction.followUp({
      content:
        "Por favor, selecciona el idioma para configurar el mensaje de bienvenida.",
      components: [row],
      ephemeral: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (buttonInteraction) => {
      let language, message;
      if (buttonInteraction.customId === "set_message_es") {
        language = "es";
        await buttonInteraction.reply({
          content: "Escribe tu mensaje de bienvenida en español:",
          ephemeral: true,
        });
      } else {
        language = "en";
        await buttonInteraction.reply({
          content: "Write your welcome message in English:",
          ephemeral: true,
        });
      }

      // Espera la respuesta del usuario
      const msgFilter = (m) => m.author.id === interaction.user.id;
      const msgCollector = buttonInteraction.channel.createMessageCollector({
        msgFilter,
        time: 60000,
      });

      msgCollector.on("collect", async (msg) => {
        message = msg.content.trim();
        msgCollector.stop();

        // Verifica si se ha proporcionado un mensaje
        if (!message) {
          await buttonInteraction.followUp({
            content: "No se proporcionó un mensaje. Inténtalo de nuevo.",
            ephemeral: true,
          });
          return;
        }

        try {
          // Guardar configuración en la base de datos
          await VanitySettings.upsert(
            {
              guildId: interaction.guild.id,
              channel: targetChannel.id,
              language: language, // Guardar el idioma
              message: message, // Guardar el mensaje
              reaction,
            },
            { returning: true }
          );

          await buttonInteraction.followUp({
            content: `Mensajes de bienvenida configurados para la vanity URL.`,
            ephemeral: true,
          });

          // Envía una vista previa del mensaje configurado de forma efímera
          const embed = new EmbedBuilder()
            .setTitle("Vista previa de Bienvenida")
            .setDescription(
              message.replace("{user}", interaction.user.toString())
            )
            .setColor("BLURPLE")
            .setFooter({
              text: `Idioma: ${language.toUpperCase()} | Canal: ${
                targetChannel.name
              }`,
            });

          await buttonInteraction.user.send({ embeds: [embed] });

          // Agregar la reacción si se especificó
          if (reaction) {
            await buttonInteraction.message
              .react(reaction)
              .catch(console.error);
          }
        } catch (error) {
          console.error("Error al guardar la configuración de vanity:", error);
          await buttonInteraction.followUp({
            content: "Hubo un error al guardar la configuración de vanity.",
            ephemeral: true,
          });
        }
      });
    });
  },
};
