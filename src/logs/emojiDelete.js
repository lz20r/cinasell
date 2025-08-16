module.exports = {
    name: "emojiDelete",

    load(data, channel, client) {
        const guild = client.channels.cache.get(channel)?.guild;
        const emoji = data.target;
        
        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: "🗑️ Emoji Eliminado",
            description: `El emoji **${emoji.name}** ha sido eliminado`,
            timestamp: new Date(),
            color: 0xff0000,
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
                    name: "🎭 Era animado",
                    value: emoji.animated ? "Sí" : "No",
                    inline: true
                }
            ],
            footer: { text: `Eliminado por: ${data.executor?.tag || "Sistema"}` },
        };

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
