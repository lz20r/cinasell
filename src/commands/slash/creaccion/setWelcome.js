const Welcome = require("../../../models/welcome");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "set-welcome",
    description: "Establece las bienvenidas en tu servidor.",
    options: [
      {
        type: 7,
        channel_types: [0],
        name: "canal",
        description: "Canal de las bienvenidas.",
        required: true,
      },
      {
        type: 3, // Tipo de string
        name: "mensaje",
        description:
          "Mensaje de bienvenida personalizado (usa {user} para mencionar al usuario).",
        required: false,
      },
    ],
  },

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getChannel("canal");
    const customMessage = interaction.options.getString("mensaje");

    const questions = [
      {
        field: "title",
        question: "Ingresa un título de bienvenida.",
        standard: "Bienvenido al servidor",
      },
      {
        field: "image",
        question: "Adjunta una imagen de bienvenida.",
        standard: "none",
      },
      {
        field: "color",
        question: "Ingresa el color del embed (en hexadecimal).",
        standard: "#ffffff",
      },
    ];

    const responses = { message: customMessage || "Bienvenido {user}" };

    for (const { field, question, standard } of questions) {
      await interaction.followUp(question);
      const msg = await waitMessage(interaction);

      if (field === "image") {
        responses[field] = msg.attachments.first()?.url || standard;
      } else {
        responses[field] = msg.content || standard;
      }
    }

    // Guardar configuración en la base de datos
    await Welcome.upsert(
      {
        guildId: interaction.guild.id,
        channel: target.id,
        ...responses,
      },
      { returning: true }
    );

    interaction.followUp("Sistema de bienvenidas establecido.");

    target.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(responses.title)
          .setDescription(
            responses.message.replace("{user}", interaction.user.toString())
          )
          .setImage(responses.image)
          .setColor(responses.color),
      ],
    });
  },
};

async function waitMessage(interaction) {
  try {
    const collected = await interaction.channel.awaitMessages({
      filter: ({ author }) => author.id === interaction.user.id,
      max: 1,
      time: 60000,
    });

    return collected.first();
  } catch {
    return null;
  }
}
