const { Collection } = require("discord.js");
const Invite = require("../models/invites");

module.exports = {
  name: "inviteCreate",

  async load(invite, client) {
    const { guild } = invite;

    let cachedInvites = client.invites.get(guild.id);
    if (!cachedInvites) {
      cachedInvites = new Collection();
      client.invites.set(guild.id, cachedInvites);
    }

    cachedInvites.set(invite.code, invite.uses);
    client.invites.set(guild.id, cachedInvites);

    try {
      await Invite.upsert({
        guildId: guild.id,
        inviteCode: invite.code,
        inviterId: invite.inviter.id,
        uses: invite.uses,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
