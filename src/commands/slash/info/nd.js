const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { not_delivered } = require("../../../data/templates.json");

module.exports = {
  data: {
    name: "nd",
    description: "Solicita evidencia del pago si no has recibido la cuenta.",
    category: "Información",
  },

  execute(interaction) {
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("toggle")
        .setLabel("English")
        .setStyle("Primary")
        .setEmoji("🇺🇸")
    );

    interaction.reply({ embeds: [not_delivered.es], components: [button] });
  },
};
