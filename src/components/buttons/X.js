module.exports = {
  id: "X",

  async execute(interaction) {
    await interaction.deferUpdate();
    await interaction.message.delete();
  }
};
