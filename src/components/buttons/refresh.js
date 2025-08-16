module.exports = {
  id: "refresh",
  async execute(interaction) {
    await interaction.deferUpdate();
  }
};
