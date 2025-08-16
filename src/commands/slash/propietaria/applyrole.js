const { SlashCommandBuilder } = require("discord.js");
const RoleNickname = require("../../../models/roleNickname");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reloadrol")
        .setDescription("Aplica el apodo guardado a todos los miembros de un rol específico.")
        .addRoleOption(option =>
            option.setName("rol")
                .setDescription("Rol al que se aplicará el apodo")
                .setRequired(true)
        ),

    owner: true,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        const role = interaction.options.getRole("rol");

        // Buscar apodo guardado en la base de datos
        const registro = await RoleNickname.findOne({
            where: {
                guildId: guild.id,
                roleId: role.id,
            },
        });

        if (!registro)
            return interaction.editReply("❌ No hay ningún apodo guardado para ese rol.");

        const members = await guild.members.fetch();
        let actualizados = 0;

        for (const member of members.values()) {
            if (!member.roles.cache.has(role.id)) continue;
            if (!member.manageable) continue;

            const nuevoNick = `[${registro.nickname}] ${member.user.username}`;

            if (member.nickname !== nuevoNick) {
                await member.setNickname(nuevoNick).catch(() => { });
                actualizados++;
            }
        }

        interaction.editReply(`✅ Se aplicó el apodo a **${actualizados}** miembros con el rol ${role.name}.`);
    },
};
