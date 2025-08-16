const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
} = require("discord.js");

module.exports = {
  id: "rename",

  async execute(interaction, _, { config }) {
    if (!interaction.member.roles.cache.has(config.roles.staff)) {
      return interaction.reply({
        content: "No tienes permiso para realizar esta acción.",
        ephemeral: true,
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Nuevo Nombre:")
        .setStyle(1)
        .setPlaceholder("Ingresa el nuevo nombre aquí.")
        .setRequired(true)
    );

    const modal = new ModalBuilder()
      .setCustomId("newname")
      .setTitle("Renombrar canal")
      .addComponents(row);

    await interaction.showModal(modal);
  },
};
