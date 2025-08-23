const { EmbedBuilder } = require('discord.js');
const path = require('path');

module.exports = {
  customId: /^recargar_conv_(\w+)_(\w+)_(\d+(?:\.\d+)?)$/,
  async execute(interaction) {
    // Extraer parámetros del customId
    const match = interaction.customId.match(/^recargar_conv_(\w+)_(\w+)_(\d+(?:\.\d+)?)/);
    if (!match) return interaction.reply({ content: 'Error al recargar.', ephemeral: true });
    const origen = match[1];
    const destino = match[2];
    const cantidad = parseFloat(match[3]);

    // Usar la función utilitaria para recargar la conversión
    const { getConversionEmbed } = require("../../utils/conversion.js");
    await interaction.deferUpdate();
    const result = await getConversionEmbed(origen, destino, cantidad);
    if (result.error) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("❌ Error de conversión")
            .setDescription(result.error)
        ],
        components: []
      });
    }
    return interaction.editReply({ embeds: [result.embed], components: [result.row] });
  }
};
