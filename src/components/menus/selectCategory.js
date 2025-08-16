module.exports = {
  id: "select-category",

  async execute(interaction, author) {
    if (interaction.user.id !== author) {
      return interaction.reply({
        content: "Solo el autor del mensaje puede interactuar con este botón.",
        ephemeral: true,
      });
    }

    await interaction.channel.setParent(interaction.values[0], {
      lockPermissions: false,
    });

    interaction.update({
      content: "Canal movido correctamente .",
      components: [],
    });
  },
};
