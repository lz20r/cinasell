module.exports = {
    name: "channelCreated",

    load(data, channel, client) {
        const guild = client.guilds.cache.get(data.guild?.id);
        const newChannel = data.target;

        const embed = {
            author: {
                name: guild?.name || "Servidor desconocido",
                icon_url: guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
            },
            title: " Canal Creado",
            description: `Se ha creado el canal <#${newChannel.id}>`,
            timestamp: new Date(),
            color: 0x00ff00,
            fields: [
                {
                    name: " Nombre",
                    value: `\`${newChannel.name}\``,
                    inline: true
                },
                {
                    name: " ID",
                    value: `\`${newChannel.id}\``,
                    inline: true
                },
                {
                    name: " Tipo",
                    value: newChannel.type === 0 ? "Texto" : newChannel.type === 2 ? "Voz" : "Otro",
                    inline: true
                }
            ],
            footer: { text: `Creado por: ${data.executor?.tag || "Sistema"}` },
        };

        if (newChannel.topic) {
            embed.fields.push({
                name: " Tema",
                value: `\`${newChannel.topic}\``,
                inline: false
            });
        }

        client.channels.cache.get(channel).send({ embeds: [embed] });
    }
};
