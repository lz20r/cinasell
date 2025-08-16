const {
  ButtonBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { ticket_types } = require("../../data/templates.json");

module.exports = {
  id: "open",
  async execute(interaction) {
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket:es")
        .setLabel("Español")
        .setEmoji("🇪🇸")
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId("ticket:en")
        .setLabel("English")
        .setEmoji("🇺🇸")
        .setStyle(1)
    );

    const message = await interaction.reply({
      content: "Por favor, elige tu idioma / Please select your language:",
      components: [buttons],
      fetchReply: true,
      ephemeral: true,
    });

    const collector = message.createMessageComponentCollector({ idle: 60000 });

    collector.on("collect", async (button) => {
      const lang = button.customId === "ticket:es" ? "es" : "en";

      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setPlaceholder(ticket_types[lang].label)
          .setOptions(ticket_types[lang].options)
          .setCustomId("select_ticket")
      );

      await button.update({
        content: ticket_types[lang].instruction,
        components: [menu],
      });

      collector.stop("click");
    });

    collector.on("end", (_, reason) => {
      if (reason === "click") return;

      interaction.editReply({
        content: `Idioma no seleccionado a tiempo. / Language not selected on time.`,
        components: [],
      });
    });
  },
};
