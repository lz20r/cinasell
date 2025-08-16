const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("canal")
    .setDescription("Crea, elimina o renombra canales del servidor / Manage channels")
    .addStringOption(option =>
      option.setName("acción")
        .setDescription("Acción: crear, eliminar o renombrar / Action: create, delete or rename")
        .setRequired(true)
        .addChoices(
          { name: "crear / create", value: "crear" },
          { name: "eliminar / delete", value: "eliminar" },
          { name: "renombrar / rename", value: "renombrar" }
        )
    )
    .addStringOption(option =>
      option.setName("tipo")
        .setDescription("Tipo de canal (solo al crear) / Channel type (only for creation)")
        .addChoices(
          { name: "texto / text", value: "texto" },
          { name: "voz / voice", value: "voz" },
          { name: "categoría / category", value: "categoría" }
        )
    )
    .addChannelOption(option =>
      option.setName("canal")
        .setDescription("Canal a eliminar o renombrar / Channel to delete or rename")
    )
    .addStringOption(option =>
      option.setName("nombre")
        .setDescription("Nombre del canal nuevo o renombrado / New name for channel")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const action = interaction.options.getString("acción");
    const type = interaction.options.getString("tipo");
    const selectedChannel = interaction.options.getChannel("canal");
    const name = interaction.options.getString("nombre");

    // Crear
    if (action === "crear") {
      if (!type || !name) {
        return interaction.reply({
          content: "❌ Necesitas especificar `tipo` y `nombre` para crear.\n❌ You must specify `type` and `name` to create.",
          ephemeral: true
        });
      }

      const typeMap = {
        texto: ChannelType.GuildText,
        voz: ChannelType.GuildVoice,
        categoría: ChannelType.GuildCategory
      };

      try {
        const newChannel = await interaction.guild.channels.create({
          name,
          type: typeMap[type]
        });

        return interaction.reply(`✅ Canal <#${newChannel.id}> creado correctamente.\n✅ Channel <#${newChannel.id}> created successfully.`);
      } catch (err) {
        console.error(err);
        return interaction.reply({
          content: "❌ Error al crear el canal.\n❌ Failed to create channel.",
          ephemeral: true
        });
      }
    }

    // Eliminar
    if (action === "eliminar") {
      if (!selectedChannel) {
        return interaction.reply({
          content: "❌ Debes seleccionar un canal para eliminar.\n❌ You must select a channel to delete.",
          ephemeral: true
        });
      }

      try {
        await selectedChannel.delete();
        return interaction.reply(`🗑️ Canal eliminado correctamente.\n🗑️ Channel deleted successfully.`);
      } catch (err) {
        console.error(err);
        return interaction.reply({
          content: "❌ No se pudo eliminar el canal.\n❌ Failed to delete channel.",
          ephemeral: true
        });
      }
    }

    // Renombrar
    if (action === "renombrar") {
      if (!selectedChannel || !name) {
        return interaction.reply({
          content: "❌ Especifica el canal y el nuevo nombre.\n❌ Specify the channel and the new name.",
          ephemeral: true
        });
      }

      try {
        await selectedChannel.setName(name);
        return interaction.reply(`✏️ Canal renombrado a \`${name}\`.\n✏️ Channel renamed to \`${name}\`.`);
      } catch (err) {
        console.error(err);
        return interaction.reply({
          content: "❌ Error al renombrar el canal.\n❌ Failed to rename channel.",
          ephemeral: true
        });
      }
    }

    return interaction.reply({
      content: "❌ Acción no reconocida.\n❌ Unknown action.",
      ephemeral: true
    });
  }
};
