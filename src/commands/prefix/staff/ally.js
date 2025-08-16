module.exports = {
  name: "ally",
  alias: ["alliance"],
  permissions: ["ManageChannels"],

  async execute(client, message) {
    const prefix = client.config?.prefix || ".";

    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply(" No tienes permisos para gestionar canales.\n You don't have permission to manage channels.");
    }

    // ID del rol Partner Manager desde config
    const partnerManagerRoleId = client.config.supportServer?.partnerManagerRole;
    
    if (!partnerManagerRoleId) {
      return message.reply(" El rol Partner Manager no está configurado.\n Partner Manager role is not configured.");
    }

    const partnerRole = message.guild.roles.cache.get(partnerManagerRoleId);
    
    if (!partnerRole) {
      return message.reply(" No se encontró el rol Partner Manager.\n Partner Manager role not found.");
    }

    try {
      // Dar permisos de ver y escribir al rol Partner Manager
      await message.channel.permissionOverwrites.edit(partnerManagerRoleId, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      // Mover a la categoría de alianzas si existe
      const allianceCategoryId = client.config.tickets?.alliance;
      if (allianceCategoryId) {
        const category = message.guild.channels.cache.get(allianceCategoryId);
        if (category) {
          await message.channel.setParent(category.id);
        }
      }
      
      const reply = await message.reply(` Permisos dados a **${partnerRole.name}** en este ticket.\n Permissions given to **${partnerRole.name}** in this ticket.`);
      
      // Eliminar el mensaje después de 5 minutos
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 300000);
      
    } catch (error) {
      console.error("Error dando permisos:", error);
      message.reply(" Error al dar permisos.\n Error giving permissions.");
    }
  }
};
