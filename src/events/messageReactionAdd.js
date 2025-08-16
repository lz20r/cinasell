const reactionRoles = require("../models/reactionRoles.js");
module.exports = {
  name: "messageReactionAdd",

  async load(reaction, user, client) {
    if(reaction.partial) {
      try {
        await reaction.fetch();
        } catch (error) {
        console.error('Error al obtener la reacción:', error);
        return;
      }
    }
    if (!reaction.emoji) return;
    const reactionId = reaction.emoji?.id ? `<:${reaction.emoji?.name}:${reaction.emoji?.id}>` : reaction.emoji?.name;
    console.log(`ID de la reacción: ${reactionId}`);
    
    const messageId = reaction.message.id;
    console.log(`Mensaje ID: ${messageId}`);
    if (user.bot) return;
    console.log(`Usuario: ${user.tag}`);
    if(!reactionId || !messageId) {
      console.error('reactionId o messageId es undefined');
      return;
    }

    const reactionRole = await reactionRoles.findOne({ where: { messageId, emojiId: reactionId } });
    if (!reactionRole) return;
    const guild = reaction.message.guild;
    const role = guild.roles.cache.get(reactionRole.roleId);

    if (!role) return;
    console.log(role);
    console.log(`Reacción añadida por ${user.tag}: ${reaction.emoji.name}`);

      const member = guild.members.cache.get(user.id);
      if (!member) return;

        await member.roles.add(role);

        await user.send(`Se te ha asignado el rol **${role.name}**.`);
  }
};
