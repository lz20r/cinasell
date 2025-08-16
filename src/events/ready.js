const Invite = require("../models/invites"); // Modelo Sequelize

module.exports = {
  name: "ready",
  once: true,

  async load(client) {
    try {
      for (const guild of client.guilds.cache.values()) {
        let cachedInvites = client.invites.get(guild.id);

        if (!cachedInvites) {
          cachedInvites = new Map();

          const dbInvites = await Invite.findAll({
            where: { guildId: guild.id },
          });

          dbInvites.forEach(({ inviteCode, uses }) => {
            cachedInvites.set(inviteCode, uses);
          });

          const currentInvites = await guild.invites.fetch();

          currentInvites.forEach((invite) => {
            cachedInvites.set(invite.code, invite.uses);
          });

          client.invites.set(guild.id, cachedInvites);
        }
      }

      console.log(`[${client.user.tag}] Conectado.`);
    } catch (error) {
      console.error(error);
    }
  },
};
