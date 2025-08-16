module.exports = {
  name: "top",
  alias: ["ranking", "leaderboard"],
  permissions: ["SendMessages"],

  async execute(client, message, args) {
    const { Staff } = require("../../../models");
    const prefix = client.config?.prefix || ".";

    try {
      // Obtener todos los staff ordenados por puntos
      const topStaff = await Staff.findAll({
        order: [["points", "DESC"]],
        limit: 10
      });

      if (topStaff.length === 0) {
        return message.reply(" No hay datos de staff disponibles.\n No staff data available.");
      }

      const embed = {
        title: " Top 10 Staff Ranking",
        color: 0x1e90ff,
        description: "Los mejores miembros del staff por puntos:\nTop staff members by points:",
        fields: [],
        timestamp: new Date(),
        footer: {
          text: "Sistema de Ranking / Ranking System",
          icon_url: client.user.displayAvatarURL()
        }
      };

      for (let i = 0; i < topStaff.length; i++) {
        const staff = topStaff[i];
        const user = await client.users.fetch(staff.userId).catch(() => null);
        const userName = user ? user.tag : `ID: ${staff.userId}`;
        
        let emoji = "";
        if (i === 0) emoji = "";
        else if (i === 1) emoji = "";
        else if (i === 2) emoji = "";
        else emoji = `${i + 1}.`;

        embed.fields.push({
          name: `${emoji} ${userName}`,
          value: `**${staff.points}** puntos/points`,
          inline: true
        });
      }

      const reply = await message.reply({ embeds: [embed] });
      
      // Eliminar mensaje después de 5 minutos
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 300000);
      
    } catch (error) {
      console.error("Error obteniendo ranking:", error);
      message.reply(" Error al obtener el ranking.\n Error getting ranking.");
    }
  }
};
