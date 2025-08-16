const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  name: "move-channel",
  alias: ["mch", "move"],
  permissions: ["ManageChannels"],

  execute(_, message, args) {
    if (args.length) {
      const parent = message.guild.channels.cache.find((value) => {
        return args.includes(value.name) && value.type === 4;
      });

      if (!parent) {
        return message.reply("No se encontró esa categoría.");
      }

      return message.channel.setParent(parent.id).then(() => {
        message
          .reply(`El canal se movió a \`${parent.name}\`.`)
          .then((msg) => setTimeout(msg.delete, 300000));
      });
    }

    const categories = message.guild.channels.cache
      .filter(({ type }) => type === 4)
      .map(({ name, id }) => ({
        label: name,
        value: id,
      }))
      .slice(0, 25);

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select-category")
        .setPlaceholder("Selecciona una categoría...")
        .addOptions(categories)
    );

    message.reply({
      content: "**Selecciona la categoría a la que deseas mover el canal:**",
      components: [menu],
    });
  },
};
