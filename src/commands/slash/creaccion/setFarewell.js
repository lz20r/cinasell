const farewell = require("../../../models/farewell");

module.exports = {
  data: {
    name: "set-farewell",
    description: "Establece las despedidas en tu servidor.",
    options: [
      {
        type: 7,
        channel_types: [0],
        name: "canal",
        description: "Canal de las despedidas.",
      },
    ],
  },

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getChannel("canal");

    const questions = [
      {
        field: "title",
        question: "Ingresa un título de despedida.",
        standard: "Despedida del servidor",
      },
      {
        field: "message",
        question: "Ingresa el mensaje de despedida.",
        standard: "Hasta pronto Viajero",
      },
      {
        field: "image",
        question: "Adjunta un imagen de despedida.",
        standard: "none",
      },
      {
        field: "color",
        question: "Ingresa el color del embed (en hexadecimal).",
        standard: 0xffffff,
      },
    ];

    const responses = {};

    for (const { field, question, standard } of questions) {
      await interaction.followUp(question);

      const msg = await waitMessage(interaction);

      if (field === "image") {
        responses[field] = msg.attachments.first()?.url || standard;
      } else {
        responses[field] = msg.content || standard;
      }
    }

    await farewell.upsert(
      {
        guildId: interaction.guild.id,
        channel: target?.id || interaction.channel.id,
        ...responses,
      },
      { returning: true }
    );

    interaction.followUp("Sistema de despedidas establecido.");
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
