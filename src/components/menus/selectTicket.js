const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { tickets_messages } = require("../../data/templates.json");
const { writeFile } = require("fs/promises");

const type = {
  consultation: "Consulta / Consultation",
  support: "Soporte / Support",
  replacement: "Reemplazo / Replacement",
  postulation: "Postulación / Postulation",
  alliance: "Alianza / Alliance",
  store_issues: "Problemas en tienda / Store Issues",
  product_not_received: "Sin recibir producto / Product not received",
  other: "Otro",
};

module.exports = {
  id: "select_ticket",

  async execute(interaction, _, { config }) {
    const { component, values, guild, user } = interaction;

    const existing = guild.channels.cache.find(({ topic }) => {
      return topic?.includes(`${type[values[0]]}: ${user.id}`);
    });

    if (existing) {
      return interaction.reply({
        content: `Ya tienes un ticket abierto: <#${existing.id}>`,
        ephemeral: true,
      });
    }

    const lang = component.data.placeholder === "¡Click Aquí!" ? "es" : "en";
    const template = tickets_messages[lang];

    let parent = guild.channels.cache.get(config.tickets[values[0]]);

    if (!parent) {
      parent = await guild.channels.create({
        type: 4,
        name: type[values[0]],
      });

      config.tickets[values[0]] = parent.id;

      writeFile("./config.json", JSON.stringify(config, null, 2));
    }

    const channel = await guild.channels.create({
      name: `⁀➷︎︎﹒ᕱ⁺、${user.username}┆${lang == "es" ? "🇪🇸" : "🇺🇸"}`,
      topic: `${parent.name}: ${user.id}`,
      parent: parent.id,
      permissionOverwrites: [
        { id: guild.id, deny: ["ViewChannel"] },
        { id: user.id, allow: ["ViewChannel", "SendMessages"] },
        { id: config.roles.staff, allow: ["ViewChannel", "SendMessages"] },
      ],
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(template.closeTicket)
        .setCustomId("close")
        .setStyle("Danger"),

      new ButtonBuilder()
        .setLabel(template.claimTicket)
        .setCustomId("assume")
        .setStyle("Primary"),

      new ButtonBuilder()
        .setLabel(template.renameTicket)
        .setCustomId("rename")
        .setStyle("Primary")
    );

    const embed = {
      title: "CinaTickets",
      description: template.welcomeMessage,
      color: 0xb19cd9,
    };

    await Promise.all([
      channel.send({ embeds: [embed], components: [buttons] }),
      interaction.update({
        content: template.ticketOpened,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Ir / Go")
              .setStyle(5)
              .setURL(`https://discord.com/channels/${guild.id}/${channel.id}`)
          ),
        ],
      }),
    ]);

    // Abrir ticket
  },
};
