module.exports = {
  name: "interactionCreate",

  load(interaction, client) {
    const { slash, buttons, modals, menus, config } = client;
    const { user, commandName, customId, message } = interaction;

    const author = message?.interaction?.user || message?.mentions?.repliedUser;

    try {
      if (interaction.isChatInputCommand()) {
        const command = slash.get(commandName);
        if (!command) return;

        if (command.owner && !config.owners.includes(user.id)) {
          return interaction.reply({
            content: "Acceso denegado.",
            ephemeral: true,
          });
        }

        command.execute(interaction, client);
      }

      if (interaction.isButton()) {
        const button = buttons.get(customId);
        if (!button) return;

        button.execute(interaction, author?.id, client);
      }

      if (interaction.type === 5) {
        const modal = modals.get(customId);
        if (!modal) return;

        modal.execute(interaction, author?.id, client);
      }

      if (interaction.type === 3) {
        const menu = menus.get(customId);
        if (!menu) return;

        menu.execute(interaction, author?.id, client);
      }
    } catch (error) {
      interaction.reply("Error inesperado al procesar la interacción.");
      console.error(error);
    }
  },
};
