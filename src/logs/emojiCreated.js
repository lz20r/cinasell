module.exports = {
    name: "emojiCreate",

    load(data, channel, client) {
        const guild = client.channels.cache.get(channel)?.guild;
        const emoji = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: "😀 Emoji Creado",
            description: `Se ha creado el emoji **${emoji.name}**`,
            timestamp: new Date(),
            color: 0x00ff00,
            thumbnail: {
                url: emoji.url
            },
            fields: [
                {
                    name: "🏷️ Nombre",
                    value: emoji.name,
                    inline: true
                },
                {
                    name: "🆔 ID",
                    value: emoji.id,
                    inline: true
                },
                {
                    name: "🎭 Animado",
                    value: emoji.animated ? "Sí" : "No",
                    inline: true
                }
            ],
            footer: { text: `Creado por: ${data.executor?.tag || "Sistema"}` },
        };

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};