const axios = require("axios");

const API_URL = "https://api.sellauth.com/v1/shops/102877/products";

const color = Math.floor(Math.random() * 0xffffff);

module.exports = {
  name: "stock",
  alias: ["st"],

  async execute(_, message) {
    try {
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
        return message.reply("No hay productos disponibles en stock.");
      }

      message.reply({
        embeds: [{ title: "CinaShop | Productos", description, color }],
      });
    } catch (error) {
      console.log(error.response || error);

      if (error.response?.status === 404) {
        return message.reply("No hay productos disponibles en stock.");
      }

      message.reply("Error desconocido. ❌");
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
