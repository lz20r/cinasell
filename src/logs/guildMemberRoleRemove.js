module.exports = {
    name: "guildMemberRoleRemove",

    load(data, channel, client) {
        const guild = client.channels.cache.get(channel)?.guild;
        const member = data.target;

        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Rol Removido",
            description: `Se le ha removido un rol a **${member.user?.tag || "Usuario desconocido"}**`,
            timestamp: new Date(),
            color: 0xff0000,
            thumbnail: {
                url: member.user?.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL()
            },
            fields: [
                {
                    name: " Usuario",
                    value: `${member.user?.tag || "Usuario desconocido"} (${member.user?.id || "ID desconocido"})`,
                    inline: true
                },
                {
                    name: " Rol Removido",
                    value: `<@&${data.changes[0].old}>`,
                    inline: true
                }
            ],
            footer: { text: `Removido por: ${data.executor?.tag || "Sistema"}` },
        };

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
