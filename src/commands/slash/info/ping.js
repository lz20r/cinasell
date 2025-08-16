module.exports = {
  data: {
    name: "ping",
    description: "Latencia del bot",
    category: "Información"
  },

  execute(interaction, client) {
    const bot = Date.now() - interaction.createdTimestamp;
    const api = client.ws.ping;

    const { emojis } = client.config;

    const condition = (ping) => {
      if (ping <= 50) return `${emojis.stable} \`${ping} ms\``;
      if (ping <= 150) return `${emojis.half} \`${ping} ms\``;

      return `${emojis.bad} \`${ping} ms\``;
    };

    const embed = {
      fields: [
        { name: "Bot:", value: condition(bot) },
        { name: "API:", value: condition(api) }
      ],
      color: 0xc30120
    };

    interaction.reply({ content: "¡Pong! 🏓", embeds: [embed] });
  }
};
