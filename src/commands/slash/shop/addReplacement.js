const sequelize = require("../../../handlers/database");
const Accounts = require("../../../models/accountsReplacement");
const tools = require("../../../tools/#export");

module.exports = {
  data: {
    name: "add-replacement",
    description: "Agrega cuentas de reemplazo.",
    category: "Propietaria",
    options: [
      {
        type: 3,
        name: "cuentas",
        description: "Cuentas a agregar.",
        required: true,
      },
      {
        type: 3,
        name: "tipo",
        description: "Selecciona el tipo de cuenta.",
        choices: [
          { name: "Microsoft", value: "microsoft" },
          { name: "Steam", value: "steam" },
          { name: "Disney", value: "disney" },
          { name: "Danz", value: "danz" },
          { name: "Netflix", value: "netflix" },
          { name: "Crunchyroll", value: "crunchyroll" },
          { name: "Max", value: "max" },
          { name: "Spotify", value: "spotify" },
          { name: "Duolingo", value: "duolingo" },
        ],
        required: true,
      },
    ],
  },
  owner: true,

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const type = interaction.options.getString("tipo");
    if (!type) return;

    const accounts = interaction.options.getString("cuentas");
    if (!accounts) return;

    const allAccounts = accounts.split(/\s+/g);

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+\|.+$/;

    if (allAccounts.some((value) => !pattern.test(value))) {
      interaction.editReply("El formato de una o más cuentas es incorrecto.");
      return;
    }

    const data = allAccounts.map((account) => ({ type, account }));

    try {
      const stipulation = await sequelize.transaction();

      await Accounts.bulkCreate(data, { transaction: stipulation });
      await stipulation.commit();

      await tools.stockMessage(client, type, data.length, "replacement");
      interaction.editReply(`Cuenta(s) de \`${type}\` agregada(s) con éxito.`);
    } catch (error) {
      interaction.editReply("Error desconocido:", error.message || error);
      console.error(error);
    }
  },
};
