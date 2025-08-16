const { writeFile } = require("fs/promises");

module.exports = {
  name: "close",
  alias: ["cerrar", "c"],

  async execute({ config }, message) {
    let parent = message.guild.channels.cache.get(config.close_tickets);

    if (!parent) {
      parent = await message.guild.channels.create({
        name: "Tickets Cerrados",
        type: 4,
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: ["ViewChannel"],
          },
          {
            id: "1299753090441809920",
            allow: ["ViewChannel"],
          },
        ],
      });

      config.close_tickets = parent.id;

      writeFile("./config.json", JSON.stringify(config, null, 2));
    }

    await message.channel.setParent(parent.id);

    message.reply("Ticket cerrado con éxito.");
  },
};
