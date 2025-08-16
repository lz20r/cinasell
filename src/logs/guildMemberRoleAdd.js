module.exports = {
    name: "guildMemberRoleAdd",

    load(data, channel, client) {
        const guild = client.channels.cache.get(channel)?.guild;
        const member = data.target;

        // Soporte para múltiples formatos de changes
        let addedRoleId = null;
        if (data.changes && data.changes[0] && data.changes[0].new) {
            if (Array.isArray(data.changes[0].new)) {
                if (typeof data.changes[0].new[0] === 'object') {
                    addedRoleId = data.changes[0].new[0].id;
                } else {
                    addedRoleId = data.changes[0].new[0];
                }
            } else if (typeof data.changes[0].new === 'object') {
                addedRoleId = data.changes[0].new.id;
            } else {
                addedRoleId = data.changes[0].new;
            }
        }

        const role = addedRoleId ? guild.roles.cache.get(addedRoleId) : null;

        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: "➕ Rol Asignado",
            description: `Se le ha asignado un rol a **${member.user?.tag || "Usuario desconocido"}**`,
            timestamp: new Date(),
            color: 0x00ff00,
            thumbnail: {
                url: member.user?.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL()
            },
            fields: [
                {
                    name: "👤 Usuario",
                    value: `${member.user?.tag || "Usuario desconocido"} (${member.user?.id || "ID desconocido"})`,
                    inline: true
                },
                {
                    name: "🎭 Rol Asignado",
                    value: role ? `${role} (${role.name})` : (addedRoleId ? `<@&${addedRoleId}>` : "Rol desconocido"),
                    inline: true
                }
            ],
            footer: { text: `Asignado por: ${data.executor?.tag || "Sistema"}` },
        };

        if (role) {
            embed.fields.push({
                name: "🎨 Color del Rol",
                value: `#${role.color.toString(16).padStart(6, '0')}`,
                inline: true
            });
        }

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};