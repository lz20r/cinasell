const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { writeFile } = require("fs/promises");

module.exports = {
  data: {
    name: "tickets",
    description: "Sistema de tickets.",
    options: [
      {
        type: 8,
        name: "role",
        description: "Selecciona el rol staff para el ticket.",
      },
    ],
  },

  async execute(interaction, { config }) {
    const role = interaction.options.getRole("rol");

    if (!role && !interaction.guild.roles.cache.get(config.roles.staff)) {
      return interaction.reply({
        content: "El rol de staff configurado no existe en este servidor.",
        ephemeral: true,
      });
    }

    if (role) {
      config.roles.staff = role.id;
      await writeFile("./config.json", JSON.stringify(config, null, 2));
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open")
        .setLabel("Click to open ~!")
        .setStyle(2)
        .setEmoji("1301327369155383376")
    );

    interaction.reply({ components: [row] });
  },
};
