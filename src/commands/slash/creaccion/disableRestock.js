const RestockChannel = require("../../../models/restockChannel.js");

module.exports = {
  data: {
    name: "disable-restock",
    description: "Desactiva las notificaciones de restock en tu servidor.",
  },

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const config = await RestockChannel.findOne({
        where: { guildId: interaction.guild.id }
      });

      if (!config) {
        return await interaction.followUp({
          content: "❌ Las notificaciones de restock no están configuradas en este servidor.",
          ephemeral: true,
        });
      }

      await RestockChannel.destroy({
        where: { guildId: interaction.guild.id }
      });

      const embed = {
        title: "✅ Notificaciones de Restock Desactivadas",
        description: "Las notificaciones automáticas de restock han sido desactivadas.",
        color: 0xff9500,
        timestamp: new Date(),
        fields: [
          {
            name: "📺 Canal anterior",
            value: `<#${config.channelId}>`,
            inline: true
          },
          {
            name: "🔔 Rol anterior",
            value: config.mentionRole ? `<@&${config.mentionRole}>` : "Ninguno",
            inline: true
          }
        ],
        footer: {
          text: `Desactivado por: ${interaction.user.tag}`
        }
      };

      await interaction.followUp({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error("Error en disable-restock:", error);
      await interaction.followUp({
        content: "❌ Ocurrió un error al desactivar las notificaciones de restock.",
        ephemeral: true,
      });
    }
  },
};
