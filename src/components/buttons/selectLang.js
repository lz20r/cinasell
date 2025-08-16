// Elegir el idioma de los tickets.
const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { ticket_types } = require("../../data/templates.json");

module.exports = {
  id: "select_lang",

  async execute(interaction) {
    const lang = interaction.component.data.label === "Español" ? "es" : "en";

    const template = ticket_types[lang];

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select_ticket")
        .setPlaceholder(template.label)
        .addOptions(template.options)
    );

    interaction.update({
      content: template.instruction,
      components: [menu],
      ephemeral: true,
    });
  },
};
