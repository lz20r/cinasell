module.exports = {
  name: "custom",
  alias: ["cust"],
  permissions: ["ManageChannels"],

  async execute(client, message, args) {
    const prefix = client.config?.prefix || ".";

    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply(" No tienes permisos para gestionar canales.\n You don't have permission to manage channels.");
    }

    if (args.length === 0) {
      return message.reply(` Debes mencionar a un usuario.\n You must mention a user.\n\n**Uso/Usage:** \`${prefix}custom @usuario\``);
    }

    const user = message.mentions.users.first() || 
                 message.guild.members.cache.get(args[0])?.user ||
                 await client.users.fetch(args[0]).catch(() => null);

    if (!user) {
      return message.reply(" Usuario no encontrado.\n User not found.");
    }

    try {
      // Dar permisos al usuario mencionado
      await message.channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      // Mover a la categoría custom si está configurada
      const customCategoryId = client.config.tickets?.custom;
      if (customCategoryId) {
        const category = message.guild.channels.cache.get(customCategoryId);
        if (category) {
          await message.channel.setParent(category.id);
        }
      }
      
      const reply = await message.reply(` **${user.tag}** ha sido agregado al ticket custom.\n **${user.tag}** has been added to the custom ticket.`);
      
      // Eliminar el mensaje después de 3 minutos
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 180000);
      
    } catch (error) {
      console.error("Error agregando usuario a custom:", error);
      message.reply(" Error al agregar usuario al ticket custom.\n Error adding user to custom ticket.");
    }
  }
};
