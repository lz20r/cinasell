const LastTickets = require("../../models/staff");

module.exports = {
  id: "assume",

  async execute(interaction, _, { config }) {
    const { channel, member, user, message } = interaction;

    if (!member.roles.cache.has(config.roles.staff)) {
      return interaction.reply({
        content: "No tienes permiso para realizar esta acción.",
        ephemeral: true,
      });
    }

    for (const row of message.components) {
      for (const button of row.components) {
        if (button.data.custom_id === "assume") {
          button.data.disabled = true;
        }
      }
    }

    let userTickets = await LastTickets.findOne({ where: { user: user.id } });

    if (!userTickets) {
      return (userTickets = await LastTickets.create({
        user: user.id,
        tickets: [channel.id],
      }));
    }

    if (userTickets.tickets >= 30) userTickets.tickets.shift();

    userTickets.tickets.push(channel.id);

    await Promise.all([
      interaction.reply(`<@${user.id}> se ha encargado de este ticket.`),
      userTickets.update({ tickets: userTickets.tickets }),
      message.edit({ components: message.components }),
    ]);
  },
};
