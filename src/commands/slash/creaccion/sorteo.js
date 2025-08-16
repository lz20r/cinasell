const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: {
    name: "sorteo",
    description: "Gestiona los sorteos y selecciona un ganador.",
    category: "Sorteos"
  },

  async execute(interaction, client) {
    // Asegurarse de que la interacción se "difiera" antes de hacer cualquier operación.
    await interaction.deferReply({ ephemeral: false });

    const createGiveaway = async (prize, duration) => {
      const participants = new Set();

      const giveawayEmbed = new EmbedBuilder()
        .setTitle(`🎉 Sorteo de **${prize}**`)
        .setDescription(
          `Reacciona con 🎉 para participar.\nDuración: ${
            duration / 1000
          } segundos.`
        )
        .setColor(0xffb347)
        .setFooter({
          text: `Iniciado por ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL()
        });

      const participateButton = new ButtonBuilder()
        .setCustomId("participate")
        .setLabel("Participar")
        .setEmoji("🎉")
        .setStyle(ButtonStyle.Primary);

      const deleteButton = new ButtonBuilder()
        .setCustomId("delete-giveaway")
        .setLabel("❌")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(participateButton);
      const rowDelete = new ActionRowBuilder().addComponents(deleteButton);

      const giveawayMessage = await interaction.editReply({
        embeds: [giveawayEmbed],
        components: [row, rowDelete]
      });

      const filter = (i) =>
        i.customId === "participate" ||
        (i.customId === "delete-giveaway" && i.user.id === interaction.user.id);
      const collector = giveawayMessage.createMessageComponentCollector({
        filter,
        time: duration
      });

      collector.on("collect", async (i) => {
        if (i.customId === "delete-giveaway") {
          await i.message.delete();
          collector.stop();
          return;
        }

        if (!participants.has(i.user.id)) {
          participants.add(i.user.id);
          await i.reply({
            content: `Has sido añadido al sorteo, <@${i.user.id}>!`,
            ephemeral: true
          });
        } else {
          await i.reply({
            content: "Ya estás participando en el sorteo.",
            ephemeral: true
          });
        }
      });

      collector.on("end", async () => {
        if (participants.size === 0) {
          await interaction.editReply({
            content: "El sorteo ha terminado, pero no hubo participantes.",
            embeds: [],
            components: []
          });
          return;
        }

        const winnerId =
          Array.from(participants)[
            Math.floor(Math.random() * participants.size)
          ];
        const winner = interaction.guild.members.cache.get(winnerId);

        const winnerEmbed = new EmbedBuilder()
          .setTitle("🎉 ¡Sorteo Terminado!")
          .setDescription(
            `El ganador del sorteo es: <@${winner.id}>\n**Premio:** ${prize}`
          )
          .setColor(0x2f3136);

        await interaction.editReply({
          content: `🎉 ¡El sorteo ha terminado!`,
          embeds: [winnerEmbed],
          components: []
        });

        winner.send(`🎉 ¡Felicidades! Has ganado el sorteo de **${prize}**.`);
      });
    };

    const showGiveawayMenu = async () => {
      const prizeOptions = [
        { label: "Nitro", value: "Nitro", description: "Sorteo de Nitro" },
        {
          label: "Tarjeta de Regalo",
          value: "Tarjeta",
          description: "Sorteo de Tarjeta"
        },
        {
          label: "Suscripción Premium",
          value: "Suscripción",
          description: "Sorteo de Suscripción"
        }
      ];

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("giveaway-menu")
        .setPlaceholder("Selecciona un premio para el sorteo")
        .addOptions(prizeOptions);

      const rowMenu = new ActionRowBuilder().addComponents(selectMenu);
      const deleteButton = new ButtonBuilder()
        .setCustomId("delete-giveaway")
        .setLabel("❌")
        .setStyle(ButtonStyle.Danger);
      const rowDelete = new ActionRowBuilder().addComponents(deleteButton);

      const embed = new EmbedBuilder()
        .setTitle("🎉 Configuración del Sorteo")
        .setDescription("Selecciona el premio para el sorteo.")
        .setColor(0x2f3136);

      await interaction.editReply({
        embeds: [embed],
        components: [rowMenu, rowDelete]
      });
    };

    await showGiveawayMenu();

    const filter = (i) =>
      i.customId === "giveaway-menu" ||
      (i.customId === "delete-giveaway" && i.user.id === interaction.user.id);

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000
    });

    collector.on("collect", async (i) => {
      if (i.customId === "delete-giveaway") {
        await i.message.delete();
        collector.stop();
        return;
      }

      const prize = i.values[0];
      const duration = 30000; // 30 segundos para el sorteo

      await createGiveaway(prize, duration);
    });

    collector.on("end", async () => {
      // No hacer nada al finalizar el collector
    });
  }
};
