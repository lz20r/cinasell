const Invites = require("../../../models/invites");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: {
    name: "set-invite",
    description:
      "Establece las configuraciones de bienvenida para todas las invitaciones.",
    options: [
      {
        type: 7,
        channel_types: [0],
        name: "canal",
        description: "Canal para el mensaje de bienvenida.",
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
    await interaction.deferReply();

    const targetChannel = interaction.options.getChannel("canal");
    const reaction = interaction.options.getString("reaccion");

    // Obtener todas las invitaciones
    const invites = await interaction.guild.invites.fetch();

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

    // Enviar el mensaje de configuración inicial
    const configMessage = await targetChannel.send({
      content:
        "Por favor, selecciona el idioma para configurar el mensaje de bienvenida.",
      components: [row],
    });

    const filter = (i) => i.user.id === interaction.user.id;

    const collector = configMessage.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (buttonInteraction) => {
      let language;
      if (buttonInteraction.customId === "set_message_es") {
        language = "es";
        await buttonInteraction.reply(
          "Escribe tu mensaje de bienvenida en español:",
          { ephemeral: true }
        );
      } else {
        language = "en";
        await buttonInteraction.reply(
          "Write your welcome message in English:",
          { ephemeral: true }
        );
      }

      // Espera la respuesta del usuario
      const msgFilter = (m) => m.author.id === interaction.user.id;
      const msgCollector = buttonInteraction.channel.createMessageCollector({
        filter: msgFilter,
        time: 60000,
      });

      msgCollector.on("collect", async (msg) => {
        const message = msg.content;
        msgCollector.stop();

        try {
          // Configuración de bienvenida bilingüe
          const messages = {
            guildId: interaction.guild.id,
            inviteCode: invites.map((invite) => invite.code),
            channel: targetChannel.id,
            language: language,
            message,
            reaction,
          };

          await Invites.bulkCreate(
            invites.map((invite) => ({
              ...messages,
              inviteCode: invite.code,
            })),
            { ignoreDuplicates: true }
          );

          await buttonInteraction.followUp(
            `Mensaje de bienvenida configurado en ${language}.`,
            { ephemeral: true }
          );

          // Enviar vista previa del mensaje configurado
          const embed = new EmbedBuilder()
            .setTitle("Vista previa de Bienvenida")
            .setDescription(
              message
                .replace("{user}", interaction.user.toString())
                .replace("{inviter}", interaction.user.tag)
            );
          await buttonInteraction.channel.send({ embeds: [embed] });

          if (reaction) {
            await configMessage.react(reaction).catch(console.error);
          }
        } catch (error) {
          console.error("Error al guardar el mensaje de bienvenida:", error);
          await buttonInteraction.followUp(
            "Hubo un error al configurar el mensaje."
          );
        }
      });
    });
  },
};
