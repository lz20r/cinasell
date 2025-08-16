const { Collection } = require("discord.js");
const interactions = require("../../../handlers/slash");
const events = require("../../../handlers/events");
const logs = require("../../../handlers/logs");

module.exports = {
  data: {
    name: "reload",
    description: "Recarga comandos, eventos y logs del bot.",
    category: "Propietaria"
  },
  owner: true,

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    // Asegurar estructura
    if (!client.commands || typeof client.commands.clear !== "function") {
      client.commands = new Collection();
    }

    try {
      // Limpia todo y vuelve a registrar
      client.commands.clear();
      client.removeAllListeners();

      await interactions(client);
      await events(client);
      await logs(client);

      await interaction.editReply({
        content: "✅ El bot ha sido recargado correctamente.",
      });
    } catch (err) {
      console.error("❌ Error al recargar:", err);
      await interaction.editReply({
        content: "❌ Hubo un error durante la recarga.",
      });
    }
  },
};
