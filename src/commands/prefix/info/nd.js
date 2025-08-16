const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { not_delivered } = require("../../../data/templates.json");

module.exports = {
  name: "not_delivered",
  alias: ["nd"],

  execute(_, message) {
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("toggle")
        .setLabel("English")
        .setStyle("Primary")
        .setEmoji("🇺🇸")
    );

    message.reply({ embeds: [not_delivered.es], components: [button] });
  },
};
