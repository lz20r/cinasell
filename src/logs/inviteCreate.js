module.exports = {
    name: "inviteCreate",

    load(data, channel, client) {
        const guild = client.channels.cache.get(channel)?.guild;
        const invite = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: "📨 Invitación Creada",
            description: `Se ha creado una nueva invitación`,
            timestamp: new Date(),
            color: 0x00ff00,
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
                    name: "⏰ Expira",
                    value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:F>` : "Nunca",
                    inline: true
                },
                {
                    name: "📊 Usos máximos",
                    value: invite.maxUses || "Ilimitado",
                    inline: true
                },
                {
                    name: "⏱️ Duración máxima",
                    value: invite.maxAge ? `${invite.maxAge} segundos` : "Permanente",
                    inline: true
                },
                {
                    name: "🔄 Temporal",
                    value: invite.temporary ? "Sí" : "No",
                    inline: true
                }
            ],
            footer: { text: `Creada por: ${data.executor?.tag || invite.inviter?.tag || "Sistema"}` },
        };

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
