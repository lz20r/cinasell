module.exports = {
    name: "guildBanRemove",

    load(data, channel, client) {
        const guild = client.channels.cache.get(channel)?.guild;
        const user = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: "🔓 Usuario Desbaneado",
            description: `**${user.tag}** ha sido desbaneado del servidor`,
            timestamp: new Date(),
            color: 0x00ff00,
            thumbnail: {
                url: user.displayAvatarURL({ dynamic: true })
            },
            fields: [
                {
                    name: "🆔 ID de usuario",
                    value: user.id,
                    inline: true
                },
                {
                    name: "📅 Cuenta creada",
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: true
                }
            ],
            footer: { text: `Desbaneado por: ${data.executor?.tag || "Sistema"}` },
        };

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
