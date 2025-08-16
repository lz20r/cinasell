const { ApplicationCommandOptionType } = require("discord.js");
const reactionRoles = require("../../../models/reactionRoles.js");
const sequelize = require("../../../handlers/database.js");
module.exports = {
  data: {
    name: "setup-reaction",
    description: "Configura un mensaje para abrir un hilo y asignar un rol al reaccionar con un emoji.",
    default_member_permissions: "8",
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "message_id",
        description: "El ID del mensaje donde se debe reaccionar.",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "emoji",
        description: "El emoji con el que se debe reaccionar.",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Role,
        name: "role",
        description: "El rol que se le asignará al usuario al reaccionar.",
        required: true,
      },
    ],
  },

  async execute(interaction, client) {
    const messageId = interaction.options.getString("message_id");
    const targetEmoji = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");

    const message = await interaction.channel.messages.fetch(messageId).catch(() => null);

    if (!message) return await interaction.reply({content: "❌ No se pudo encontrar el mensaje con el ID proporcionado.", flags: 64 });
    if (!role) return await interaction.reply({content: "❌ Rol no encontrado. Asegúrate de que el rol existe.", flags: 64 });
    
    message.react(targetEmoji).catch(() => {
      return interaction.reply({content: `❌ No se pudo reaccionar con el emoji ${targetEmoji}. Asegúrate de que el emoji es válido y que el bot tiene permisos para reaccionar.`, flags: 64 });
    });

    reactionRoles.create({
      messageId: message.id,
      roleId: role.id,
      emojiId: targetEmoji,
    }).catch(err => {
      console.error("Error al guardar el rol de reacción:", err);
      return interaction.reply({content: "❌ Ocurrió un error al guardar la configuración de reacción.", flags: 64 });
    });

    await interaction.reply({content: `Configuración guardada: Reacciona con ${targetEmoji} al mensaje con ID ${messageId} para abrir un hilo y recibir el rol ${role.name}.`, flags: 64});
  },
};
