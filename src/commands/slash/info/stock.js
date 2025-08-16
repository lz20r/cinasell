const axios = require("axios");

const API_URL = "https://api.sellauth.com/v1/shops/102877/products";

const color = Math.floor(Math.random() * 0xffffff);

module.exports = {
  data: {
    name: "stock",
    description: "Cuentas en la tienda",
  },

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const { data: response } = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${process.env.SELL_AUTH}` },
      });

      let description = "";

      response.data.forEach((product) => {
        if (product.stock_count > 0) {
          description += `${getEmoji(product.path)} **${product.name}**: ${
            product.stock_count
          }\n`;
        }
      });

      if (!description) {
        return interaction.editReply("No hay productos disponibles en stock.");
      }

      interaction.editReply({
        embeds: [{ title: "CinaShop | Productos", description, color }],
      });
    } catch (error) {
      console.log(error.response || error);

      if (error.response?.status === 404) {
        return interaction.editReply("No hay productos disponibles en stock.");
      }

      interaction.editReply("Error desconocido. ❌");
    }
  },
};

function getEmoji(path) {
  const emojis = {
    spotify: "🟢",
    crunchyroll: "🟠",
    dazn: "🔵",
    "youtube-premium": "🔴",
    max: "🟣",
    duolingo: "🟩",
    disney: "🟦",
    "gamer-esencial": "🟥",
    "leyenda-epica": "🟪",
    shadowlegendx: "🟫",
    promocodes: "🟨",
    "amazon-prime": "🟧",
  };

  return emojis[path] || "";
}
