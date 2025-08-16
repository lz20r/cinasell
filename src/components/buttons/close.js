const transcript = require("discord-html-transcripts");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  id: "close",

  async execute(interaction, _, { config }) {
    const { guild, channel, user, member } = interaction;

    if (!member.roles.cache.has(config.roles.staff)) {
      return interaction.reply({
        content: "No tienes permiso para realizar esta acción.",
        ephemeral: true,
      });
    }

    const logsChannelId = "1397311512737218671";
    const target = guild.channels.cache.get(logsChannelId);

    const ticketAuthorId = channel.topic?.match(/(\d+)/)?.[0];
    const ticketAuthorMember = guild.members.cache.get(ticketAuthorId);
    const ticketAuthor = ticketAuthorMember?.user.username || "Usuario desconocido";

    const openedAt = new Date(channel.createdAt).toLocaleString();
    const closedAt = new Date().toLocaleString();

    // ✅ Generar transcripción local
    const file = await transcript.createTranscript(channel, {
      filename: `${channel.name}.html`,
    });

    const supportRoleId = "1299753090441809920";
    const supportRole = guild.roles.cache.get(supportRoleId);

    let supportMessageCountByUser = {};
    if (supportRole) {
      const supportMembers = guild.members.cache.filter((m) =>
        m.roles.cache.has(supportRoleId)
      );

      const messages = await channel.messages.fetch({ limit: 100 });
      messages.forEach((message) => {
        if (supportMembers.has(message.author.id)) {
          const authorName = message.author.username;
          supportMessageCountByUser[authorName] = (supportMessageCountByUser[authorName] || 0) + 1;
        }
      });
    }

    let supportMessagesList = "Ningún mensaje de soporte encontrado.";
    if (Object.keys(supportMessageCountByUser).length > 0) {
      supportMessagesList = Object.entries(supportMessageCountByUser)
        .map(([user, count]) => `[${count}]: ${user}`)
        .join("\n");
    }

    const embed = new EmbedBuilder()
      .setColor("#5d6ca3")
      .setTitle("Ticket Cerrado")
      .setThumbnail(user.displayAvatarURL())
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setDescription(`El ticket ha sido cerrado por ${user.username}.`)
      .addFields(
        { name: "Nombre del Ticket", value: channel.name, inline: true },
        { name: "Autor del Ticket", value: ticketAuthor, inline: true },
        { name: "Tipo de Ticket", value: channel.parent?.name || "Desconocido", inline: true },
        { name: "Cerrado por", value: user.username, inline: true },
        { name: "Fecha de Cierre", value: closedAt, inline: true },
        { name: "Fecha de Abertura", value: openedAt, inline: true },
        {
          name: "Mensajes de Soporte",
          value: supportMessagesList,
          inline: false,
        }
      )
      .setFooter({
        text: `Cerrado por ${user.username}`,
        iconURL: user.displayAvatarURL(),
      })
      .setTimestamp();

    const reviews = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("reviews")
        .setPlaceholder("Dejanos tu reseña.")
        .addOptions(
          { label: "⭐", value: "1" },
          { label: "⭐⭐", value: "2" },
          { label: "⭐⭐⭐", value: "3" },
          { label: "⭐⭐⭐⭐", value: "4" },
          { label: "⭐⭐⭐⭐⭐", value: "5" }
        )
    );

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({
      content: "Cerrando ticket en 5 segundos.",
    });

    setTimeout(async () => {
      // Enviar embed + archivo al canal de logs
      await target.send({
        content: "📎 Transcripción adjunta:",
        embeds: [embed],
        files: [file],
      });

      // Enviar por DM (si es posible)
      if (ticketAuthorMember) {
        ticketAuthorMember.send({
          content: "Aquí está la transcripción de tu ticket:",
          embeds: [embed],
          files: [file],
          components: [reviews],
        }).catch(() => {
          console.warn(`❌ No se pudo enviar DM a ${ticketAuthor}`);
        });
      }

      // Eliminar el canal
      await channel.delete().catch(console.error);
    }, 5000);
  },
};
