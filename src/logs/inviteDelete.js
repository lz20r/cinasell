module.exports = {
    name: "inviteDelete",

    load(data, channel, client) {
        const guild = client.channels.cache.get(channel)?.guild;
        const invite = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: "🗑️ Invitación Eliminada",
            description: `Se ha eliminado una invitación`,
            timestamp: new Date(),
            color: 0xff0000,
            fields: [
                {
                    name: "🔗 Código",
                    value: invite.code,
                    inline: true
                },
                {
                    name: "📺 Canal",
                    value: `<#${invite.channelId}>`,
                    inline: true
                },
                {
                    name: "📊 Usos",
                    value: invite.uses?.toString() || "0",
                    inline: true
                },
                {
                    name: "👤 Creador original",
                    value: invite.inviter ? `${invite.inviter.tag}` : "Desconocido",
                    inline: true
                }
            ],
            footer: { text: `Eliminada por: ${data.executor?.tag || "Sistema"}` },
        };

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
