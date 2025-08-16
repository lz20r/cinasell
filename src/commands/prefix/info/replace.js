const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { replace } = require("../../../data/templates.json");

module.exports = {
  name: "replace",
  alias: ["r"],

  execute(_, message) {
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("toggle")
        .setLabel("English")
        .setStyle("Primary")
        .setEmoji("🇺🇸")
    );

    message.reply({ embeds: [replace.es], components: [button] });
  },
};
