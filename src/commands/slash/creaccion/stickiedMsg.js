const StickiedMsg = require("../../../models/stickiedMsg");

module.exports = {
  data: {
    name: "stickied-msg",
    description: "Fija un mensaje.",
    options: [
      {
        type: 3,
        name: "mensaje",
        description: "Establece un mensaje. Usa \\n para saltos de línea.",
        required: true,
      },
      {
        type: 7,
        channel_types: [0],
        name: "canal",
        description: "Selecciona el canal.",
      },
    ],
  },

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const content = interaction.options.getString("mensaje");
    const channel = interaction.options.getChannel("canal");

    const text = content.replace(/\\n/g, "\n");

    await StickiedMsg.upsert(
      {
        channel: channel?.id || interaction.channel.id,
        message: text,
      },
      { returning: true }
    );

    await interaction.editReply("Listo, acción realizada.");

    interaction.channel.send(text);
  },
};
