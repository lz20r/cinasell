module.exports = {
    name: "guildBanAdd",

    load(data, channel, client) {
        const guild = client.channels.cache.get(channel)?.guild;
        const user = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: "🔨 Usuario Baneado",
            description: `**${user.tag}** ha sido baneado del servidor`,
            timestamp: new Date(),
            color: 0x8b0000,
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
            footer: { text: `Baneado por: ${data.executor?.tag || "Sistema"}` },
        };

        if (data.reason) {
            embed.fields.push({
                name: "📝 Razón",
                value: data.reason,
                inline: false
            });
        }

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
