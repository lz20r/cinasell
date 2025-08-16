const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  TextInputBuilder,
  ModalBuilder,
  TextInputStyle
} = require("discord.js");

module.exports = {
  data: {
    name: "giveaways",
    description: "Gestiona los sorteos y selecciona un ganador.",
    category: "Sorteos"
  },

  async execute(interaction, client) {
    // Asegurarse de que la interacción se "difiera" antes de hacer cualquier operación.
    await interaction.deferReply({ ephemeral: false });

    const logsEnabled = true; // Opción del sistema de logs (puede configurarse por el usuario).

    // Función para crear la transcripción del canal
    const transcribeChannel = async (channel) => {
      const messages = await channel.messages.fetch({ limit: 100 });
      let transcript = "";
      messages.forEach((msg) => {
        transcript += `[${msg.createdAt}] ${msg.author.tag}: ${msg.content}\n`;
      });
      return transcript;
    };

    const createGiveaway = async (
      prize,
      duration,
      giveawayChannel,
      newName
    ) => {
      const participants = new Set();

      // Renombrar el canal si se proporciona un nuevo nombre
      if (newName) {
        await giveawayChannel.setName(newName);
      }

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

      const giveawayMessage = await giveawayChannel.send({
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
          await giveawayChannel.send({
            content: "El sorteo ha terminado, pero no hubo participantes.",
            embeds: [],
            components: []
          });
          giveawayChannel.delete(); // Cerrar el canal si no hay participantes
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

        await giveawayChannel.send({
          content: `🎉 ¡El sorteo ha terminado!`,
          embeds: [winnerEmbed],
          components: []
        });

        winner.send(`🎉 ¡Felicidades! Has ganado el sorteo de **${prize}**.`);

        if (logsEnabled) {
          const transcript = await transcribeChannel(giveawayChannel);
          // Aquí puedes decidir qué hacer con la transcripción
          console.log("Transcripción del sorteo:\n", transcript);
        }

        giveawayChannel.delete(); // Cerrar el canal al finalizar el sorteo
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

      const renameButton = new ButtonBuilder()
        .setCustomId("rename-giveaway")
        .setLabel("Renombrar Canal")
        .setStyle(ButtonStyle.Secondary);

      const attachmentButton = new ButtonBuilder()
        .setCustomId("add-attachment")
        .setLabel("Adjuntar Archivo")
        .setStyle(ButtonStyle.Secondary);

      const rowRename = new ActionRowBuilder().addComponents(
        renameButton,
        attachmentButton
      );

      const embed = new EmbedBuilder()
        .setTitle("🎉 Configuración del Sorteo")
        .setDescription("Selecciona el premio para el sorteo.")
        .setColor(0x2f3136);

      await interaction.editReply({
        embeds: [embed],
        components: [rowMenu, rowRename, rowDelete]
      });
    };

    await showGiveawayMenu();

    const filter = (i) =>
      i.customId === "giveaway-menu" ||
      (i.customId === "delete-giveaway" && i.user.id === interaction.user.id) ||
      i.customId === "rename-giveaway" ||
      i.customId === "add-attachment";

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000
    });

    let newName = null; // Variable para almacenar el nuevo nombre del canal
    let attachment = null; // Variable para almacenar el archivo adjunto

    collector.on("collect", async (i) => {
      if (i.customId === "delete-giveaway") {
        await i.message.delete();
        collector.stop();
        return;
      }

      if (i.customId === "rename-giveaway") {
        // Mostrar un modal para renombrar el canal
        const modal = new ModalBuilder()
          .setCustomId("renameModal")
          .setTitle("Renombrar Canal de Sorteos");

        const newNameInput = new TextInputBuilder()
          .setCustomId("newName")
          .setLabel("Nuevo nombre para el canal")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Introduce el nuevo nombre");

        const actionRow = new ActionRowBuilder().addComponents(newNameInput);
        modal.addComponents(actionRow);

        await i.showModal(modal);
      }

      if (i.customId === "add-attachment") {
        const file = i.message.attachments.first();
        if (file) {
          attachment = file.url;
          await i.reply({
            content: `Archivo adjuntado: ${file.name}`,
            ephemeral: true
          });
        } else {
          await i.reply({
            content: "No se encontró ningún archivo adjunto.",
            ephemeral: true
          });
        }
      }

      if (i.customId === "giveaway-menu") {
        const prize = i.values[0];
        const duration = 30000; // 30 segundos para el sorteo

        // Crear canal de sorteos en la misma categoría donde esté el panel
        const categoryId = interaction.channel.parentId; // Obtener la categoría actual
        const giveawayChannel = await interaction.guild.channels.create({
          name: `giveaway-${prize}`,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages
              ]
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.SendMessages
              ]
            }
          ]
        });

        await createGiveaway(prize, duration, giveawayChannel, newName);
      }
    });

    collector.on("end", async () => {
      // No hacer nada al finalizar el collector
    });
  }
};
