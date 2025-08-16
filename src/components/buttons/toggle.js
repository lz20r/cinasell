const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const templates = require("../../data/templates.json");

module.exports = {
  id: "toggle",

  async execute(interaction) {
    const lang = interaction.component.data.label === "Español" ? "es" : "en";

    const newButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle("Primary")
        .setCustomId("toggle")
        .setEmoji(lang === "en" ? "🇪🇸" : "🇺🇸")
        .setLabel(lang === "en" ? "Español" : "English")
    );

    const type = getType(interaction.message.embeds);

    if (!type) {
      return interaction.reply("No se encontró la plantilla correspondiente.");
    }

    templates[type][lang].color = 14671325;

    interaction.update({
      embeds: [templates[type][lang]],
      components: [newButton],
    });
  },
};

function getType(embeds) {
  if (!embeds || !embeds.length) return;

  const { title } = embeds[0].data;

  if (title === "Not delivered" || title === "No entregado") {
    return "not_delivered";
  } else if (title === "Reemplazo" || title === "Replacement") {
    return "replace";
  }

  return;
}
