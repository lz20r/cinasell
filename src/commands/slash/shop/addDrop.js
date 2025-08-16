const sequelize = require("../../../handlers/database");
const Accounts = require("../../../models/accountsDrop");
const tools = require("../../../tools/#export");

const PRODUCTOS = [
  "Discord Nitro 1m",
  "Discord Nitro 3m",
  "Discord Nitro Anual",
  "Discord Boost",
  "Discord Promocode",
  "Discord Deco Random",
  "Discord Nameplates",
  "Alcampo",
  "Burger King",
  "Carrefour",
  "Telepizza",
  "Glovo",
  "Mediamarkt",
  "Starbucks (2k-6k)",
  "Ilusiona Club (1k-1.5k)",
  "Wonderbox (0-20€)",
  "Leroy Merlin (5-10€)",
  "AMC+",
  "Amazon Music",
  "Amazon Prime",
  "Apple Music",
  "Capcut",
  "ChatGPT IA",
  "Crunchyroll",
  "Dazn",
  "Deezer",
  "Dickey’s",
  "Disney+",
  "Direct TV Go",
  "Express VPN",
  "HideMyAss VPN",
  "Duolingo",
  "Fortnite",
  "GTA V",
  "HBO Max",
  "Minecraft",
  "Mubi",
  "NBA",
  "Netflix",
  "Panel Boosts",
  "Paramount",
  "Roblox",
  "Rust",
  "Spotify",
  "Steam",
  "Tidal",
  "Totorobot",
  "UFC",
  "Viki Rakuten",
  "Vix",
  "Wondershare"
];

module.exports = {
  data: {
    name: "add-drop",
    description: "Agrega al drop.",
    category: "Propietaria",
    options: [
      {
        type: 3,
        name: "cuentas",
        description: "Cuentas a agregar (email|pass).",
        required: true,
      },
      {
        type: 3,
        name: "tipo",
        description: "Selecciona el tipo de cuenta.",
        autocomplete: true,
        required: true,
      },
    ],
  },
  owner: true,

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const filtered = PRODUCTOS.filter(p =>
      p.toLowerCase().includes(focused.toLowerCase())
    );

    await interaction.respond(
      filtered.slice(0, 25).map(p => ({ name: p, value: p.toLowerCase().replace(/\s+/g, "_") }))
    );
  },

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const type = interaction.options.getString("tipo");
    if (!type) return;

    const accounts = interaction.options.getString("cuentas");
    if (!accounts) return;

    const allAccounts = accounts.split(/\s+/g);
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+\|.+$/;

    if (allAccounts.some((value) => !pattern.test(value))) {
      return interaction.editReply("El formato de una o más cuentas es incorrecto.");
    }

    const data = allAccounts.map((account) => ({ type, account }));

    try {
      const stipulation = await sequelize.transaction();

      await Accounts.bulkCreate(data, { transaction: stipulation });
      await stipulation.commit();

      await tools.stockMessage(client, type, data.length, "drop");
      interaction.editReply(`Cuenta(s) de \`${type}\` agregada(s) con éxito.`);
    } catch (error) {
      console.error(error);
      interaction.editReply(`Error desconocido: ${error.message || error}`);
    }
  },
};
