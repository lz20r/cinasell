module.exports = {
  name: "r",
  alias: ["remove", "rem"],
  permissions: ["ManageChannels"],

  async execute(client, message, args) {
    const prefix = client.config?.prefix || ".";

    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply(" No tienes permisos para gestionar canales.\n You don't have permission to manage channels.");
    }

    if (args.length === 0) {
      return message.reply(` Debes mencionar a un usuario.\n You must mention a user.\n\n**Uso/Usage:** \`${prefix}r @usuario\``);
    }

    const user = message.mentions.users.first() || 
                 message.guild.members.cache.get(args[0])?.user ||
                 await client.users.fetch(args[0]).catch(() => null);

    if (!user) {
      return message.reply(" Usuario no encontrado.\n User not found.");
    }

    try {
      // Quitar permisos del usuario en este canal
      await message.channel.permissionOverwrites.edit(user.id, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false
      });

      // Mover a la categoría close si está configurada
      const closeCategoryId = client.config.tickets?.close;
      if (closeCategoryId) {
        const category = message.guild.channels.cache.get(closeCategoryId);
        if (category) {
          await message.channel.setParent(category.id);
        }
      }
      
      const reply = await message.reply(` **${user.tag}** ha sido removido del ticket.\n **${user.tag}** has been removed from the ticket.`);
      
      // Eliminar el mensaje después de 3 minutos
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 180000);
      
    } catch (error) {
      console.error("Error removiendo usuario:", error);
      message.reply(" Error al remover usuario del ticket.\n Error removing user from ticket.");
    }
  }
};
