const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
  name: "delete",
  alias: ["eliminar", "dch"],
  permissions: ["ManageChannels"],

  async execute(_, message) {
    const channel = message.mentions.channels.first() || message.channel;

    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply("No tienes permiso para gestionar canales.");
    }

    if (!message.guild.members.me.permissions.has("ManageChannels")) {
      return message.reply("No tengo permiso para gestionar canales.");
    }

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("confirm").setLabel("Si").setStyle(3),
      new ButtonBuilder().setCustomId("cancel").setLabel("No").setStyle(4)
    );

    const sent = await message.channel.send({
      content: `¿Estás seguro de que deseas eliminar el canal?`,
      components: [buttons],
    });

    const collector = sent.createMessageComponentCollector({
      filter: ({ user }) => user.id === message.author.id,
      time: 15000,
    });

    collector.on("collect", async (button) => {
      if (button.customId === "confirm") {
        try {
          if (channel.id !== button.channel?.id) {
            button.update({
              content: `Canal eliminado con éxito.`,
              components: [],
            });
          }

          channel.delete();
        } catch (error) {
          console.error(error);

          await button.update({
            content: "❌ Hubo un error al eliminar el canal.",
            components: [],
          });
        }
      } else if (button.customId === "cancel") {
        button.update({
          content: "Eliminación cancelada.",
          components: [],
        });
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await sent.edit({
          content: "⏰ Tiempo de confirmación agotado.",
          components: [],
        });
      }
    });
  },
};
