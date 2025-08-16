const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { emojis } = require("../../config.json");

module.exports = async function (interaction, embeds) {
  const { back, home, delt, next } = emojis;

  if(!back || !home || !delt || !next) {
    console.log("Emojis faltantes.")
    return;
  }
  
  const buttons = new ActionRowBuilder().addComponents([
    new ButtonBuilder().setEmoji(back).setCustomId("back").setStyle(1),
    new ButtonBuilder().setEmoji(home).setCustomId("home").setStyle(2),
    new ButtonBuilder().setEmoji(delt).setCustomId("delt").setStyle(4),
    new ButtonBuilder().setEmoji(next).setCustomId("next").setStyle(1),
  ]);

  let currentPage = 0;

  const method = interaction.deferred ? "editReply" : "reply";

  const message = await interaction[method]({
    embeds: [embeds[currentPage]],
    components: [buttons],
    fetchReply: true,
  });

  const collector = message.createMessageComponentCollector({
    idle: 300000,
  });

  collector.on("collect", async (button) => {
    await button.deferUpdate();

    if (button.user.id !== interaction.user.id) {
      return button.followUp({
        content: `No puedes usar estos botones.`,
        ephemeral: true,
      });
    }

    switch (button.customId) {
      case "home":
        currentPage = 0;
        collector.resetTimer();
        break;

      case "back":
        currentPage = currentPage > 0 ? --currentPage : embeds.length - 1;
        collector.resetTimer();
        break;

      case "next":
        currentPage = currentPage + 1 < embeds.length ? ++currentPage : 0;
        collector.resetTimer();
        break;

      case "delt":
        collector.stop("delete");
        await message.delete();
        return;
    }

    await message.edit({
      embeds: [embeds[currentPage]],
      components: [buttons],
    });
  });

  collector.on("end", (_, reason) => {
    if (reason === "delete" || reason === "messageDelete") return;

    const components = disableButtons(message.components);
    message.edit({ components });
  });
};

function disableButtons(components) {
  for (const component of components) {
    for (const button of component.components) {
      button.data.disabled = true;
    }
  }

  return components;
}
