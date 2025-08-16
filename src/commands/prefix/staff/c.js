module.exports = {
  name: "c",
  alias: ["claim"],
  permissions: ["ManageChannels"],

  async execute(client, message) {
    const prefix = client.config?.prefix || ".";

    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply(" No tienes permisos para gestionar canales.\n You don't have permission to manage channels.");
    }

    try {
      // Dar permisos al usuario que ejecuta el comando
      await message.channel.permissionOverwrites.edit(message.author.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      // Mover a la categoría claim si está configurada
      const claimCategoryId = client.config.tickets?.claim;
      if (claimCategoryId) {
        const category = message.guild.channels.cache.get(claimCategoryId);
        if (category) {
          await message.channel.setParent(category.id);
        }
      }
      
      const reply = await message.reply(` Ticket reclamado por **${message.author.tag}**.\n Ticket claimed by **${message.author.tag}**.`);
      
      // Eliminar el mensaje después de 3 minutos
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 180000);
      
    } catch (error) {
      console.error("Error reclamando ticket:", error);
      message.reply(" Error al reclamar ticket.\n Error claiming ticket.");
    }
  }
};
