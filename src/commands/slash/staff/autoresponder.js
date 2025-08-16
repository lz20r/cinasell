const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { Op } = require("sequelize");
const AutoResponder = require("../../../models/autoResponder");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autoresponder")
        .setDescription("Gestiona las respuestas automáticas")
        .addSubcommand(subcommand =>
            subcommand.setName("add")
                .setDescription("Añadir una respuesta automática")
                .addStringOption(option =>
                    option.setName("trigger")
                        .setDescription("Palabra clave para activar la respuesta")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("response")
                        .setDescription("Respuesta del bot")
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option.setName("delete")
                        .setDescription("¿Eliminar la respuesta automáticamente?")
                )
                .addBooleanOption(option =>
                    option.setName("wildcards")
                        .setDescription("¿Activar coincidencias parciales?")
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("remove")
                .setDescription("Eliminar una respuesta automática")
                .addStringOption(option =>
                    option.setName("trigger")
                        .setDescription("Palabra clave que quieres eliminar")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("list")
                .setDescription("Ver todas las respuestas automáticas")
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "⛔ No tienes permisos para usar este comando.", ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const trigger = interaction.options.getString("trigger")?.toLowerCase();
        const response = interaction.options.getString("response");
        const shouldDelete = interaction.options.getBoolean("delete") || false;
        const enableWildcards = interaction.options.getBoolean("wildcards") || false;

        try {
            if (subcommand === "add") {
                // Verificar si ya existe el autoresponder con el mismo `trigger_text`
                const existing = await AutoResponder.findOne({
                    where: { guildId: interaction.guild.id, trigger_text: trigger }
                });

                if (existing) {
                    return interaction.reply({
                        content: `⚠️ Ya existe una respuesta automática para: **${trigger}**`,
                        ephemeral: true
                    });
                }

                await AutoResponder.create({
                    guildId: interaction.guild.id,
                    trigger_text: trigger,
                    response: response,
                    delete_after: shouldDelete,
                    wildcards: enableWildcards
                });

                return interaction.reply({
                    content: `✅ Respuesta automática añadida:\n**${trigger}** → ${response}\n🗑 **Eliminación automática:** ${shouldDelete ? "Sí" : "No"}\n🔍 **Wildcard:** ${enableWildcards ? "Sí" : "No"}`,
                    ephemeral: true
                });
            }

            if (subcommand === "remove") {
                const deleted = await AutoResponder.destroy({
                    where: { guildId: interaction.guild.id, trigger_text: trigger }
                });

                return interaction.reply({
                    content: deleted
                        ? `✅ Respuesta automática eliminada: **${trigger}**`
                        : "⚠️ No se encontró esa respuesta automática.",
                    ephemeral: true
                });
            }

            if (subcommand === "list") {
                const autoresponders = await AutoResponder.findAll({
                    where: { guildId: interaction.guild.id }
                });

                if (!autoresponders.length) {
                    return interaction.reply({
                        content: "⚠️ No hay respuestas automáticas configuradas.",
                        ephemeral: false
                    });
                }

                const list = autoresponders
                    .map((r, index) => `${index + 1}. **${r.trigger_text}** → ${r.response} (${r.delete_after ? "🗑 Se elimina" : "❌ No se elimina"}) ${r.wildcards ? "🔍 (Wildcard activo)" : ""}`)
                    .join("\n");

                return interaction.reply({
                    content: `📜 **Lista de respuestas automáticas:**\n${list}`,
                    ephemeral: false
                });
            }

        } catch (error) {
            console.error("❌ Error en el comando /autoresponder:", error);
            return interaction.reply({ content: "❌ Ocurrió un error al procesar la solicitud.", ephemeral: true });
        }
    }
};
