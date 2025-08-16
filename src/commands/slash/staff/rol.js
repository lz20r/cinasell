const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rol")
        .setDescription("Gestiona roles del servidor")
        .addStringOption(option =>
            option
                .setName("acción")
                .setDescription("Acción a realizar")
                .setRequired(true)
                .addChoices(
                    { name: "Crear", value: "crear" },
                    { name: "Eliminar", value: "eliminar" },
                    { name: "Editar", value: "editar" },
                    { name: "Dar", value: "dar" },
                    { name: "Quitar", value: "quitar" },
                    { name: "Dar a todos", value: "all" },
                    { name: "Quitar a todos", value: "removeall" }
                )
        )
        .addStringOption(option =>
            option
                .setName("rol")
                .setDescription("Nombre del rol o nuevo nombre si se edita")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("extra")
                .setDescription("Modo extra: antiguo nombre o tipo (bots/humans/all)")
                .setRequired(false)
        )
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuario al que dar/quitar rol")
                .setRequired(false)
        ),

    async execute(interaction) {
        const action = interaction.options.getString("acción");
        const roleName = interaction.options.getString("rol");
        const extra = interaction.options.getString("extra");
        const user = interaction.options.getUser("usuario");

        const member = user ? await interaction.guild.members.fetch(user.id) : null;
        const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());

        // Requiere permisos
        if (!interaction.member.permissions.has("ManageRoles"))
            return interaction.reply({ content: "❌ No tienes permiso para gestionar roles.", ephemeral: true });

        if (["crear"].includes(action)) {
            const newRole = await interaction.guild.roles.create({ name: roleName });
            return interaction.reply(`✅ Rol \`${newRole.name}\` creado.`);
        }

        if (!role) return interaction.reply("❌ Rol no encontrado.");

        if (action === "eliminar") {
            await role.delete();
            return interaction.reply(`🗑️ Rol \`${role.name}\` eliminado.`);
        }

        if (action === "editar") {
            if (!extra) return interaction.reply("❌ Falta el nuevo nombre del rol.");
            await role.setName(extra);
            return interaction.reply(`✏️ Rol renombrado a \`${extra}\`.`);
        }

        if (action === "dar") {
            if (!member) return interaction.reply("❌ Usuario no encontrado.");
            await member.roles.add(role);
            return interaction.reply(`✅ Rol \`${role.name}\` asignado a ${member}.`);
        }

        if (action === "quitar") {
            if (!member) return interaction.reply("❌ Usuario no encontrado.");
            await member.roles.remove(role);
            return interaction.reply(`❌ Rol \`${role.name}\` removido de ${member}.`);
        }

        if (action === "all") {
            if (!["all", "bots", "humans"].includes(extra)) return interaction.reply("❌ Especifica `bots`, `humans` o `all` como modo.");
            const members = await interaction.guild.members.fetch();
            let success = 0;

            for (const m of members.values()) {
                if ((extra === "bots" && !m.user.bot) || (extra === "humans" && m.user.bot)) continue;
                try {
                    await m.roles.add(role);
                    success++;
                } catch { }
            }

            return interaction.reply(`✅ Rol \`${role.name}\` asignado a ${success} ${extra}.`);
        }

        if (action === "removeall") {
            if (!["all", "bots", "humans"].includes(extra)) return interaction.reply("❌ Especifica `bots`, `humans` o `all` como modo.");
            const members = await interaction.guild.members.fetch();
            let success = 0;

            for (const m of members.values()) {
                if ((extra === "bots" && !m.user.bot) || (extra === "humans" && m.user.bot)) continue;
                try {
                    await m.roles.remove(role);
                    success++;
                } catch { }
            }

            return interaction.reply(`✅ Rol \`${role.name}\` removido de ${success} ${extra}.`);
        }

        return interaction.reply("❌ Acción no reconocida.");
    }
};
