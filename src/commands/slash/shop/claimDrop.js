const { Sequelize } = require("sequelize");
const Accounts = require("../../../models/accountsDrop");

module.exports = {
  data: {
    name: "claim-drop",
    description: "Reclama tu drop.",
  },

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.member.roles.cache.has("1295804623390507089")) {
      interaction.editReply("No puedes usar este comando.");
      return;
    }

    try {
      const model = await Accounts.findOne({
        order: [Sequelize.literal("RAND()")],
      });

      const { type, account } = model.dataValues;

      await Promise.all([
        interaction.member.send(`Tu cuenta de **${type}**:\n||${account}||`),
        interaction.editReply("Has reclamado tu cuenta con éxito."),
        model.destroy(),
      ]);
    } catch (error) {
      console.error(error);
      interaction.editReply(`Error inesperado: ${error.message || error}`);
    }
  },
};
