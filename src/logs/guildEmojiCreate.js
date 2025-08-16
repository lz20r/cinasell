module.exports = {
    name: "guildEmojiCreate",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const emoji = data.target;

        const embed = {
                title: " Emoji Creado",
                description: `Se ha creado un nuevo emoji`,
                timestamp: new Date(),
                color: 0x00ff00,
                thumbnail: { url: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}` },
                fields: [
                    { name: " Nombre", value: `\`:${emoji.name}:\``, inline: true },
                    { name: " ID", value: `\`${emoji.id}\``, inline: true },
                    { name: " Animado", value: emoji.animated ? "Sí" : "No", inline: true },
                    { name: " Uso", value: `<:${emoji.name}:${emoji.id}>`, inline: true }
                ],
                footer: { text: `Creado por: ${data.executor?.tag || "Sistema"}` },
            };

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
